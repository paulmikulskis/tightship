
import { config } from 'tightship-config';
import Bull from 'bull';
import { differenceInMilliseconds, format } from 'date-fns';
import twilio from 'twilio';


const CRON_MIDNIGHT = '0 0 * * *';
const CRON_ONE = '0 1 * * *';
const CRON_TWO = '0 2 * * *';
const CRON_THREE = '0 3 * * *';
const CRON_MINUTE = '0 * * * *';

export const processors = {
    pai: 'PAI',
    cds: 'CDS',
}

export const dailyQueue = new Bull(
    config.get('bull.queues.daily'), 
    { redis: 
        { port: config.get('redis.port'), 
        host: config.get('redis.host')} 
    }
);

export const liveFeedQueue = new Bull(
    config.get('bull.queues.live'), 
    { redis: 
        { port: config.get('redis.port'), 
        host: config.get('redis.host')} 
    }
);

export const SMSQueue = new Bull(
    config.get('bull.queues.sms'), 
    { redis: 
        { port: config.get('redis.port'), 
        host: config.get('redis.host')} 
    }
);

/**
 * All of the Bull queues this application uses
 */
export const allQueues = [
    dailyQueue,
    liveFeedQueue,
    SMSQueue
];


/**
 * Clears all queues in the Redis Bully 
 */
export const clearAllQueues = () => {
    allQueues.forEach(queue => {
        queue.empty();
        // make sure all Repeatble cron-eque jobs are cleared
        queue.getRepeatableJobs().then(jobs => {
            jobs.forEach(job => {
                queue.removeRepeatableByKey(job.key);
                return true;
            });
        });
    });
};


/**
 * 
 * @returns all the repeatable jobs in the Bully daily download queue
 */
export const queryDailyDownload = () => {
    return dailyQueue.getRepeatableJobs();
}

/**
 * Adds a daily download job for a given payment processor to the Bull daily queue
 * 
 * @param {String} uid user ID from Firebase
 * @param {String} email user email
 * @param {String} processor payment processor in question
 * @param {String} cron_override an optional crontab String to override the default beahviour
 * @returns a Promise that resolves when the items in the Bully daily queue
 */
export const enqueueDailyDownload = async (
    uid, 
    email, 
    processor, 
    cron_override=undefined
    ) => {
    const job_data = {
        uid: uid,
        email: email,
        processor: processor,
    }
    return await dailyQueue.add(
        `${processor}-dailyReport-${email}`,
        job_data,
        { 
            repeat: { cron: cron_override ? cron_override : CRON_THREE },
            jobId: uid,
        })
};


/**
 * Adds a live feed job for a given payment processor to the Bull LiveFeed queue
 * 
 * @param {String} uid user ID from Firebase
 * @param {String} email user email
 * @param {String} processor payment processor in question
 * @param {String} cron_override an optional crontab String to override the default beahviour
 * @returns a Promise that resolves when the items in the Bully live feed queue
 */
export const enqueueLiveFeed = async (
    uid, 
    email, 
    processor, 
    cron_override=undefined
    ) => {
    const job_data = {
        uid: uid,
        email: email,
        processor: processor,
    }
    return await liveFeedQueue.add(
        `${processor}-liveFeed-${email}`,
        job_data,
        { 
            repeat: { cron: cron_override ? cron_override : CRON_MINUTE },
            jobId: uid,
        })
};


/**
 * Function that is fed a Firebase document (our "connections" document), and 
 * reads the Bull queues to determine if the state of the document matches the state 
 * of the current live running bull queues.  If the states are not equal in the daily job
 * or the live job queues, then jobs are added or removed to bring the Bull queues into state.
 * 
 * @param {Dictionary} document the Firebase connections document 
 * @param {*} uid the user ID of this user
 * @param {*} user_email the email address of this user
 * @param {*} queued_jobs an array of Bull Job objects 
 */
const processPAIQueues = async (document, uid, user_email, queued_jobs) => {
    var daily_job = queued_jobs
        .filter(job => job.name.startsWith('PAI-dailyReport'))[0];
    var live_job = queued_jobs
        .filter(job => job.name.startsWith('PAI-liveFeed'))[0];
    
    if (document.pai_active) {
        console.log('found active PAI setting')
        // if there isn't already a daily download job created, then let's create one
        if (!daily_job) {
            await enqueueDailyDownload(uid, user_email, processors.pai, CRON_MINUTE);
            console.log('added daily job for PAI to queue for user ', user_email);
        } else {
            // else, a job already exists and we should make sure it has the right settings
            console.log('requeing daily user PAI job for user ', user_email);
            await dailyQueue.removeRepeatableByKey(daily_job.key);
            await enqueueDailyDownload(uid, user_email, processors.pai, CRON_MINUTE);
        }

        // check if the user has enabled live pulls
        if (document.pai_live_active) {
            if (!live_job) {
                await enqueueLiveFeed(uid, user_email, processors.pai);
                console.log('added live feed for ', user_email);
            } else {
                console.log('requeing live job for ', user_email);
                await dailyQueue.removeRepeatableByKey(live_job.key);
                await enqueueDailyDownload(uid, user_email, processors.pai);
            }
        }

    } else {
        // if PAI is marked as not_active, lets make sure there are no daily jobs
        if (daily_job) {
            console.log('PAI marked as inactive but job present...deleting job')
            await dailyQueue.removeRepeatableByKey(daily_job.key);
            console.log('daily job deleted for user: ', user_email);
        }
        if (live_job) {
            console.log('PAI marked as active but live job present...deleting live job');
            await dailyQueue.removeRepeatableByKey(live_job.key);
            console.log('live job deleted for user: ', user_email);
        }
    }
}

/**
 * Takes in a change from Firebase and kicks off the needed processors to process
 * the change in the Queueing system.
 * 
 * @param {FirebaseChange} change the "change" object from Firebase of the document
 */
const processConnectionsDocument = async (change) => {
    const document = change.doc.data();
    const uid = change.doc.id;
    const user_email = document.user;
    var queued_jobs = await dailyQueue.getRepeatableJobs();
    queued_jobs = queued_jobs.filter(job => job.id === uid);

    await processPAIQueues(document, uid, user_email, queued_jobs);
    return true;
};

const sendSMSVaultPlan = async (job) => {
    var numberStrings = job.data.numbers;
    const vaulterNames = job.data.vaulterNames;
    const terminalNames = job.data.terminals;
    const terminalAmounts = job.data.amounts;
    const date = new Date(job.data.date);
    const originalMessage = job.data.message || '';
    const messages = formatVaultPlanMessages(terminalNames, terminalAmounts, vaulterNames, date, originalMessage);
    return true;
};

const enqueueSMSVaultPlan = async ({ uid, vaulterNames, numbers, terminals, amounts, date, message, sendTime }) => {
    const jobTime = sendTime ? new Date(sendTime) : new Date('1/1/1969')
    const options = {
        attempts: 2,
        delay: jobTime.getTime() < new Date().getTime() ? 0 : differenceInMilliseconds(jobTime, new Date())
    };
    const data = {
        uid: uid,
        vaulterNames: vaulterNames || ['fellow scallywag'],
        numbers: numbers,
        terminals: terminals,
        amounts: amounts,
        date: date || new Date(),
        message: message || ''
    };
    SMSQueue.add('vaultPlan', data, options);
};

export { 
    processConnectionsDocument,
    sendSMSVaultPlan,
    enqueueSMSVaultPlan,
};
