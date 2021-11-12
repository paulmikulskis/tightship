import { Router } from 'express';
import admin from 'firebase-admin';
import { collection, doc, setDoc } from "firebase/firestore"; 
var router = Router();
import { FireStorage, Bully } from 'fire-storage';
import Bull from 'bull';

const DailyQueue = new Bull('daily-queue');

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
}

function connectionSettingsListner() { 
  return db.collection('connections')
    .onSnapshot(data => newDataHandler(data));
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/start-fabbing', function(req, res, next) {
  unsubscribeConnections = connectionSettingsListner()
  res.sendStatus(200)
})

router.get('/stop-fabbing', function(req, res, next) {
  unsubscribeConnections();
  res.sendStatus(200)
})

const module = {
  router,
};

export { router };
