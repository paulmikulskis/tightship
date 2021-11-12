import { expect, config as ChaiConfig } from 'chai';
import { FireStorage, Bully } from 'fire-storage';
import App from 'fabbit-producer';
import { config } from 'tightship-config';
import "isomorphic-fetch";
import mlog from 'mocha-logger';
import { pai, paiMock } from 'papi';
import { dailyDownloadPAI } from 'papi';

ChaiConfig.includeStack = true;

// confirm the environment is set up right
mlog.log(`NODE_ENV set to ${config.get('env')}`)
const emulated = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!emulated) {
  mlog.error('env FIREBASE_AUTH_EMULATOR_HOST not set, Firebase SDK will point to Prod!!')
  process.exit(69);
}

// set up fabbit-producer
const fabbitPort = config.get('fabbitProducer.port');
mlog.log('using fabbit-producer port: ', fabbitPort);
const fabbitProducer = App.app.listen(fabbitPort);


// set up firestore emulator
// .env.test should have the Firestore SDK Point to emulator with 
// the env FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
const db = FireStorage.getDatabase();



//console.log('# of connections documents: ', condocs.data());


const createUserDocument = async (uid='testUid') => {
  const conref = db.collection('accounts');
  await conref.doc(uid).set({
    account_type: 'premium',
    email: 'sungbean@yungsten.com',
    emailVerified: true,
    name: "Yungsten Sung",
  });
  return true
};

const createPaiConnectionDocument = async (
  uid='testUid', 
  pai_enabled=true,
  pai_username='paulm',
  pai_password='passpass',
  pai_active=true,
  ) => {
  const conref = db.collection('connections');
  await conref.doc(uid).set({
    pai_enabled: pai_enabled,
    pai_username: pai_username,
    pai_password: pai_password,
    pai_active: pai_active,
    pai_live_feed: false,
  });
  return true
};

describe('tightship tests', async function() {



  describe("fabbit-producer tests", async function() {
    // before fabbit-producer testing suite as a whole, we want
    // to doubly ensure that the database is cleared 
    before(async function () {
      mlog.log(`clearing emulated firestore database for ${config.get('firebase.projectId')}`)
      await FireStorage.clearEmulatedFirestore();
    })

    // after fabbit producer tests, make sure to exit the 
    // fabbit producer process to close firestore pending sockets! 
    after(async function() {  
      await fabbitProducer.close();
      mlog.log('fabbit-producer gracefully shut down');
    });

    describe("test", async function() {
      
      it("should write to Firestore in a mocha test", async function() {
        const condocs = await db.collection('connections').get();
        // make sure we are getting zero documents in the database so 
        // we can be confident we understand the state
        expect(condocs.size).to.equal(0);
        const res = await fetch(`http://localhost:${fabbitPort}/start-fabbing`);
        // make sure we are set up to fab
        expect(res.status).to.equal(200);

        var jobs = await Bully.queryDailyDownload();
        await Bully.clearAllQueues();
        await createPaiConnectionDocument();
        jobs = await Bully.queryDailyDownload();
        
      });
    });

    describe("Listening functionality", function() {
      it("should Connections documents in state with the Bull queue", function() {
        expect(true).to.equal(true);
      });
    });

  });



  describe("Client Libraries", async function() {
    
    describe('PAI', async function() {
      
      it('should be able to log in', async function() {
        const client = new pai();
        const result = await client.login(
          config.get('pai.test.username'), 
          config.get('pai.test.password')
        );
        expect(result).to.equal(true);
      });

      describe('Log Parsing and Postgres interaction', async function() {

        it('should be able to call the daily download function', async function() {
          const job = {
            uid: 'testUid_420'
          }
          await createUserDocument('testUid_420');
          await createPaiConnectionDocument('testUid_420');
          const result = await dailyDownloadPAI(job, new paiMock());
          expect(result).to.equal(true);
        });
      });

    });
  });



});


