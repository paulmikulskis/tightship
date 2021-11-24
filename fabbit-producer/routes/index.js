/*****
 * This file serves as a general bootstrap for all of the function of the fabbit producer.
 * For now, it is easiest to have the functions of the Fabbit producer start and stop via simply
 * hitting a certain route with a GET request, though later on we might want to have a more cohesive
 * way to tie together the endpoints.
 * 
 * As it stands right now, fabbit-producer handles:
 *    - listening to Firestore for any updates to user connections documents, 
 *            and updating the Bull daily-queue to match the state that Firestore intends.
 *    - listening to the Bull SMS queue for any new messages that need to be sent
 *            via the Twilio API.  This will include things like vaulting alerts and vault plans
 *    - listening to the Bull Email queue for any new messages that need to be sent
 *            via the [insert email provider] API.  Same stuff like SMS content-wise
 * 
 */
import { Router } from 'express';
import admin from 'firebase-admin';
import { collection, doc, setDoc } from "firebase/firestore"; 
var router = Router();
import { FireStorage, Bully } from 'fire-storage';
import Bull from 'bull';
import { Twilio } from 'tightship-integrations';
import { format } from 'date-fns';

// Daily Queue processing ------------------
let unsubscribeConnections;
const db = FireStorage.getDatabase();
const newDataHandler = (querySnapshot) => {

    querySnapshot.docChanges().forEach(change => {
      Bully.processConnectionsDocument(change);
    })

    var cities = [];
    querySnapshot.forEach((doc) => {
        cities.push(JSON.stringify(doc, null, 2));
    });
    //console.log("current connections: \n", cities.join(",\n "));
};
function connectionSettingsListner() { 
  return db.collection('connections')
    .onSnapshot(data => newDataHandler(data));
};;

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
* Picks apart a job object from Bull.process() and formats the expected vault plan
* into a pretty printed message string.
* 
* @param {dict} bulljob job from Bull.process()
* @returns {string} formatted message string
*/
const formatVaultPlanMessages = (terminalNames, terminalAmounts, vaulterNames, date, originalMessage) => {
  return vaulterNames.map((vaulterName, index) => {
      const headerLine = `\nAhoy there ${vaulterName}!\nTightShip here with your vaulting plan for ${format(date, 'EEE, LLL io')}:\n\n`;
      const vaultLines = terminalNames.map((name, i) => {
          return `${name}:\n$${numberWithCommas(terminalAmounts[i])}\n`
      }).reduce((acc, current) => {
          return acc + `${current}\n`
      });
      const originaMsg = originalMessage.length > 0 ? `user message:\n${originalMessage}` : ''
      const finalForm = headerLine + vaultLines + originaMsg;
      //console.log(`finished creating SMS message to send:\n\n\n${finalForm}`);
      return finalForm;
  });
};

// SMS Queue processing ------------------
const SMSQueue = Bully.SMSQueue;
const SMSVaultPlanProcessor = async (job) => {
    const vaulterNames = job.data.vaulterNames;
    const terminalNames = job.data.terminals;
    const terminalAmounts = job.data.amounts;
    const date = new Date(job.data.date || null);
    const originalMessage = job.data.message || '';
    const messages = formatVaultPlanMessages(terminalNames, terminalAmounts, vaulterNames, date, originalMessage);
    const numberStrings = job.data.numbers.map(num => '+1' + num);
    console.log(`numberStrings: ${numberStrings}`)

    for (const [num, i] of numberStrings.entries()) {
      console.log(`for loop, num: ${num}, i: ${i}`)
      await Twilio.sendMessage(messages[num], i);
    };
    return true;
};



// API and Route definition
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/start-fabbing', function(req, res, next) {
  unsubscribeConnections = connectionSettingsListner()
  res.sendStatus(200)
});
router.get('/stop-fabbing', function(req, res, next) {
  unsubscribeConnections();
  res.sendStatus(200)
});
router.get('/start-texting', function(req, res, next) {
  SMSQueue.process('vaultPlan', SMSVaultPlanProcessor);
  res.sendStatus(200);
});
router.get('/stop-texting', function(req, res, next) {
  SMSQueue.close();
})


const module = {
  router,
};

export { router };
