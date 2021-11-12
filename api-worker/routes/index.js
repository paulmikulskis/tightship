import { Router } from 'express';
import admin from 'firebase-admin';
import { collection, doc, setDoc } from "firebase/firestore"; 
var router = Router();
import { FireStorage, Bully } from 'fire-storage';
import Bull from 'bull';
import { dailyDownloadPAI } from 'papi';

const db = FireStorage.getDatabase();
const dailyQueue = Bully.allQueues.dailyQueue
const liveQueue = Bully.allQueues.liveFeedQueue

const processDailyJob = (job) => {

    switch (job.processor) {
      case 'PAI': dailyDownloadPAI(job);
      case 'default': return console.log('PAI daily download no-op');
    };
    
};


router.get('/start-working', function(req, res, next) {
  dailyQueue.process(processDailyJob);
  res.sendStatus(200)
});

router.get('/stop-working', function(req, res, next) {
  for (var queue of Bully.allQueues) {
    console.log(`closing queue "${queue.name}"`);
    queue.close();
  };
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TightShip API Worker Home' });
});

const module = {
  router,
};

export { router };
