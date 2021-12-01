import { PAIClient } from "./pai-client.js";
import { FireStorage, Bully, Postgres } from 'fire-storage';
import { logger } from './logger.js';
import { subDays, addDays, format, formatISO9075 } from 'date-fns';



const dailyDownload = async (job, paiClient=undefined) => {
    
    // CHECK POSTGRES to make sure that we have an account 
    // for this user before we start downloading anything
    const user = await Postgres.userExists(
        Postgres.db, job.data.uid
    );
    const userDoc = await FireStorage.getUserDoc(job.data.uid);
    const userData = userDoc.data()
    if (!userData) {
        logger.error(`no user account email found for user id ${job.data.uid}, stopping PAI dailyDownload function`);
        return false;
    }
    if (!user) {
        logger.info(`creating psql entry for user ${userDoc.id}, email=${userData.email}`);
        await Postgres.createUser(
            Postgres.db,
            userDoc.id,
            userData.name,
            userData.email,
            userData.account_type ? userData.account_type : 'premium',
            {} // in case we want to add extra information later!
        );      
    };

    // log in with PAI, get ATM List and Daily Transaction Report, vaulting info
    // we allow the passing of a PAI client to allow for mock clients for testing
    const pai = paiClient ? paiClient : new PAIClient();
    const { username, password } = await FireStorage.getPAICredentials(job.data.uid);
    pai.login(username, password);
    const atms = await pai.downloadReport('ATM List');
    const balances = await pai.downloadReport('Daily Balance');
    const PAITerminalIds = atms.loc( {columns: ['Terminal Number']} )
        .values
        .flatMap( (v) => { return v });
    const atmState = await crupdateATMs(job.data.uid, PAITerminalIds, atms, balances);
    //console.log('ATM STATE: ', atmState);
    // get the earliest date of the ATM whose info we need:
    var lookbackDate = subDays(new Date(), 3).setHours(0, 0, 0, 0);
    for (var tid of PAITerminalIds) {
        if (atmState[tid]) {
            if (atmState[tid].last_log < lookbackDate) {
                logger.debug(`found new oldest daily_log lookback date from terminal ${tid}: ${formatISO9075(atmState[tid].last_log)}`)
                lookbackDate = atmState[tid].last_log
            };
        };
    };
    const dtr = await pai.downloadReport('Daily Transaction Report', lookbackDate);
    const aclr = await pai.downloadReport('ATM Cash Load Report', lookbackDate);
    const errr = await pai.downloadReport('Terminal Error Report', lookbackDate);

    // take away the time component from the dates on the ATM cash load report so we can match against them
    logger.info(`processing daily logs for ${job.data.uid} for terminals: ${Object.keys(atmState)}`);
    logger.info(`found furtherst needed lookback date to be ${formatISO9075(lookbackDate)}`);
    await createTerminalErrorLogs(job.data.uid, PAITerminalIds, errr)
    for (var tid of Object.keys(atmState)) {
        logger.info(`processing daily logs for terminal ${tid}`)
        await createDailyLogs(atmState[tid], dtr, aclr);
    };
    return true;


};


const createDailyLogs = async (atmData, dtr, aclr) => {
    // construct an array of dates that we need to download from PAI for this ATM
    var dateArray = new Array();
    var currentDate = atmData.last_log;
    while (currentDate <= (new Date()).setHours(0, 0, 0, 0)) {
        dateArray.push( (new Date (currentDate)).setHours(0, 0, 0, 0) );
        currentDate = addDays(currentDate, 1);
    };
    var vaultLogs = aclr.to_json();
    var dailyTxnReport = dtr.to_json();

    for (var [index, log] of vaultLogs.entries()) {
        vaultLogs[index]['Trx Time'] = new Date(log['Trx Time']).setHours(0, 0, 0, 0);
    };
    for (var [index, log] of dailyTxnReport.entries()) {
        dailyTxnReport[index]['Settlement Date'] = new Date(log['Settlement Date']).setHours(0, 0, 0, 0);
    };

    for (var day of dateArray) {
        // create the daily log here, for each date in the dateArray of interest
        logger.debug(`processing terminal ${atmData.terminal_number} on ${formatISO9075(day)}`);
        var vaulted = vaultLogs.filter( (value) => {
            return (value['Trx Time'] == day) && (value['Terminal Number'] == atmData.terminal_number)
        })[0];
        vaulted = vaulted ? vaulted['Cash Load'] : "$0";
        
        var thisDay = dailyTxnReport.filter( (value) => {
            return (value['Settlement Date'] == day) && (value['Terminal Number'] == atmData.terminal_number)
        })[0];

        if (thisDay) {
            await Postgres.createDailyLog(
                Postgres.db,
                atmData.terminal_number,
                parseFloat(thisDay['End Of Day Balance'].replace(/[$,]+/g,"")),
                thisDay['Total Trxs'] > 0,
                day,
                thisDay['Total Trxs'],
                thisDay['WD Trxs'],
                // we need to parseFloat and regex to remove commas and money signs
                // from these CSV reports i.e. $1,323.20 -> 1323.2
                parseFloat(thisDay['Withdrawal'].replace(/[$,]+/g,"")),
                thisDay['NWD Trxs'],
                thisDay['Envelope Deposit Trxs'],
                parseFloat(thisDay['Envelope Deposit Amount'].replace(/[$,]+/g,"")),
                thisDay['Check Deposit Trxs'],
                parseFloat(thisDay['Check Deposit Amount'].replace(/[$,]+/g,"")),
                thisDay['Cash Deposit Trxs'],
                parseFloat(thisDay['Cash Deposit Amount'].replace(/[$,]+/g,"")),
                thisDay['Total Deposit Trxs'],
                parseFloat(thisDay['Total Deposit Amount'].replace(/[$,]+/g,"")),
                parseFloat(vaulted.replace(/[$,]+/g,"")),
                {}
            );
        } else {
            var yesterday = dailyTxnReport.filter( (value) => {
                return (value['Settlement Date'] == subDays(day, 1)) && (value['Terminal Number'] == atmData.terminal_number)
            })[0];
            logger.debug(
                `got no daily log values for terminal ${atmData.terminal_number} on ${formatISO9075(day)}`
            );
            try {
                await Postgres.createDailyLog(
                    Postgres.db,
                    atmData.terminal_number,
                    parseFloat(yesterday['End Of Day Balance'].replace(/[$,]+/g,"")),
                    false,
                    day,
                    yesterday['Total Trxs'],
                    yesterday['WD Trxs'],
                    // we need to parseFloat and regex to remove commas and money signs
                    // from these CSV reports i.e. $1,323.20 -> 1323.2
                    parseFloat(yesterday['Withdrawal'].replace(/[$,]+/g,"")),
                    yesterday['NWD Trxs'],
                    yesterday['Envelope Deposit Trxs'],
                    parseFloat(yesterday['Envelope Deposit Amount'].replace(/[$,]+/g,"")),
                    yesterday['Check Deposit Trxs'],
                    parseFloat(yesterday['Check Deposit Amount'].replace(/[$,]+/g,"")),
                    yesterday['Cash Deposit Trxs'],
                    parseFloat(yesterday['Cash Deposit Amount'].replace(/[$,]+/g,"")),
                    yesterday['Total Deposit Trxs'],
                    parseFloat(yesterday['Total Deposit Amount'].replace(/[$,]+/g,"")),
                    parseFloat(vaulted.replace(/[$,]+/g,"")),
                    {}
                );
            } catch (err) {
                logger.debug(
                    `tried backfilling terminal ${atmData.terminal_number} on ${formatISO9075(day)} since terminal appears inactive, but no logs for yesterday`
                );
            }
        };
    };

    return true;


};


/**
 * Looks through the PAI "ATM List" report, as well as the ATMs listed for the current
 * user's ID (from job.id) within psql.  ATM table entries that have not yet been created
 * will be created, and existing ones will be updated.  
 * @param {String} uid the user ID, probably obtained from the Bull job.id
 * @param {Array<String>} PAITerminalIds list of terminal IDs from this user's ATM List report from PAI
 * @param {DataFrame} atms Danfo dataframe of "ATM List" report from PAI
 */
export const crupdateATMs = async (uid, PAITerminalIds, atms, balances) => {
    logger.info('crupdating ATMs');
    const psqlTerminalList = await Postgres.getUserTerminals(
        Postgres.db,
        uid,
    );
    //console.log('attempting to get terminal IDs from psqlTerminalList=', psqlTerminalList)
    const psqlTIDs = psqlTerminalList.map(el => el.terminal_id);
    // make new entries for ATMs that psql has not seen yet...
    const tIDsToMake = PAITerminalIds.filter( (v) => {
        return psqlTIDs.indexOf(v) < 0;
    });
    // ...and update all the existing ones in case any info has changed
    const tIDsToUpdate = PAITerminalIds.filter( (v) => {
        return psqlTIDs.indexOf(v) >= 0;
    });

    var allAtms = {};
    logger.debug(
        `crupdate ATMs for uid: ${uid}, tIDsToMake=${tIDsToMake}, tIDsToUpdate=${tIDsToUpdate}`
    );
    for (const tID of tIDsToUpdate) {
        const term = atms.loc({rows: atms['Terminal Number'].eq(tID)}).to_json()[0];
        const surgchg = parseFloat(term['Surcharge Amount'].split(' ')[1].replace(/[$,]+/g,""));
        var balance = balances
            .loc({rows: atms['Terminal Number'].eq(tID)})
            .to_json()[0]
        //console.log('BALANCE: ', balance);
        balance = balance ? parseFloat(
            Object.entries(balance)
            .filter(([key]) => {
                return !key.includes('Terminal Number') && !key.includes('Location')
            })
            .map(([key, value]) => {
                return [new Date(key), value]
            })
            .reduce((acc, key, i, arr) => {
                return (
                        (new Date(acc[0]).getTime() < new Date(key[0]).getTime()) && 
                        (i < arr.length - 1) 
                        ) ? key : acc
            })[1]) : 0
        var lastLog = await Postgres.lastDailyLogDate(
            Postgres.db,
            tID
        );
        const firstTx = term['First Trx'] == '' ? new Date() : new Date(term['First Trx']);
        var lastLog = lastLog ? lastLog : firstTx;
        allAtms = { 
            ...allAtms,
            [tID]: {
                surcharge_amnt: surgchg, 
                location_name: term['Location'],
                group: term['Group'],
                partner: term['Market Partner'],
                address: term['Address'],
                city: term['City'],
                state: term['State'],
                zip: term['Zip'],
                active: (term['Status'] == 'Activated' ? true : false),
                first_txn: firstTx,
                last_log: lastLog,
                terminal_number: tID,
                last_balance: balance,
            } 
        }
        await Postgres.updateTerminal(
            Postgres.db,
            tID,
            allAtms[tID].surcharge_amnt,
            allAtms[tID].location_name,
            allAtms[tID].group,
            allAtms[tID].partner,
            allAtms[tID].address,
            allAtms[tID].city,
            allAtms[tID].state,
            allAtms[tID].zip,
            allAtms[tID].active,
            allAtms[tID].last_balance
        );
    };

    for (const tID of tIDsToMake) {
        const term = atms.loc({rows: atms['Terminal Number'].eq(tID)}).to_json()[0];
        const surgchg = parseFloat(term['Surcharge Amount'].split(' ')[1].replace(/[$,]+/g,""))
        var balance = balances
            .loc({rows: atms['Terminal Number'].eq(tID)})
            .to_json()[0];
        // get the balance of the ATM day prior to the last day on the pulled report
        // create am array from the dict return, map the values to date objects, then return
        // the greatest date value so long it is not the last one since the last one might be
        // data from today, and might not be populated yet.  
        balance = balance ? parseFloat(
            Object.entries(balance)
            .filter(([key]) => {
                return !key.includes('Terminal Number') && !key.includes('Location')
            })
            .map(([key, value]) => {
                return [new Date(key), value]
            })
            .reduce((acc, key, i, arr) => {
                return (
                        (new Date(acc[0]).getTime() < new Date(key[0]).getTime()) && 
                        (i < arr.length - 1) 
                        ) ? key : acc
            })[1]) : 0
        // do not download terminals with no transaction history
        if (term['First Trx'] == '') {
            console.log(`terminal ${term['Location']} has first tx has ${term['First Trx']}`)
            continue;
        };

        const firstTx = new Date(term['First Trx']);
        console.log(`THIS TERMINAL FIRST TRX FROM DATA FRAME = ${firstTx}`)
        //console.log('BALANCE=', balance)
        allAtms = {
            ...allAtms,
            [tID]: {
                surcharge_amnt: surgchg,
                location_name: term['Location'],
                group: term['Group'],
                partner: term['Market Partner'],
                address: term['Address'],
                city: term['City'],
                state: term['State'],
                zip: term['Zip'],
                first_txn: firstTx,
                active: (term['Status'] === 'Activated' ? true : false),
                last_log: firstTx,
                terminal_number: tID,
                last_balance: balance
            }
        };
        //console.log('allatms: ', allAtms);
        await Postgres.createTerminal(
            Postgres.db,
            tID,
            allAtms[tID].surcharge_amnt,
            uid,
            allAtms[tID].location_name,
            allAtms[tID].group,
            allAtms[tID].partner,
            allAtms[tID].address,
            allAtms[tID].city,
            allAtms[tID].state,
            allAtms[tID].zip,
            allAtms[tID].first_txn,
            allAtms[tID].active,
            allAtms[tID].last_balance
        );
    };
    logger.debug('finished crupdating atms')
    // return all the ATM objects that were just created and/or updated
    return allAtms;
}

const createTerminalErrorLogs = async (uid, PAITerminalIds, errorReport) => {
    logger.info(`crupdating terminal errors for user ${uid}`);

    for (var tid of PAITerminalIds) {
        var datefilter = undefined;
        const tidErrs = await Postgres.getTerminalErrors(
            Postgres.db, 
            tid, 
            datefilter,
        );
        const errs = errorReport.loc({rows: errorReport['Terminal Number'].eq(tid)}).to_json()
        for (var err of errs) {
            const errExists = tidErrs.map(el => {
                // these were used for low level debugging dates...want to keep for now 
                // console.log('--------\ntesting to see if duplicate error exists:')
                // console.log(`el.terminal_id=${el.terminal_id}, tid=${tid}`);
                // console.log(`el.error_time=${el.error_time}, this_error's time=${err['Error Time']}`)
                // console.log(`in Date() format: ${new Date(el.error_time)}, ${new Date(err['Error Time'])}`)
                // console.log(`these dates are equated as ${new Date(el.error_time).getTime() === new Date(err['Error Time']).getTime()}`)
                return (el.terminal_id == tid) && (new Date(el.error_time).getTime() === new Date(err['Error Time']).getTime())
            }).reduce((a, b) => a || b, false);
            if (!errExists) {
                //console.log(`creating error for terminal ${tid}, \nerr=${JSON.stringify(err)}`)
                try {
                    await Postgres.createTerminalError(
                        Postgres.db,
                        tid,
                        err['Group'],
                        err['Market Partner'],
                        err['Location'],
                        err['Address'],
                        err['City'],
                        err['State'],
                        err['Zip'],
                        new Date(err['Error Time']),
                        err['Error Code'],
                        err['Error Description'],
                    );
                } catch (err) {
                    logger.error(`unable to create terminal error log for tid=${tid}, \n${err}`)
                }
            };
        };
    };
    return true
};


export {
    dailyDownload as dailyDownloadPAI,
    crupdateATMs as crupdateATMsPAI,
    createTerminalErrorLogs as createTerminalErrorLogs
}
