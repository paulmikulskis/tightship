import { Router } from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { config } from 'tightship-config';
var router = Router();
import { FireStorage, Bully } from 'fire-storage';
import Bull from 'bull';
import { dailyDownloadPAI, paiMock } from 'papi';


const db = FireStorage.getDatabase();
const dailyQueue = Bully.dailyQueue
const liveQueue = Bully.liveFeedQueue

const processDailyJob = async (job) => {
    const mockClient = config.get('pai.mockClient') ? new paiMock() : undefined;
    if (job.data.processor === 'PAI') {
      console.log(`downloading PAI for job ${job.data.uid}`)
      dailyDownloadPAI(job, mockClient).then(result => {
        const docRef = db.collection('connections').doc(job.data.uid);
        docRef.set({
            'pai_processing': false,
            'pai_connected': true
          }, { merge: true }
        );
      });
    } else {
      console.log(`skipping unknow processor for job=${JSON.stringify(job, null, 2)}`)
    }
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
