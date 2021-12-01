import path from 'path';
import dotenv from 'dotenv';
import os from 'os';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
  // shh! 🤫 dont tell! 
  dotenv.config({ path: path.resolve(process.cwd(), '../.private/.env.secret') })
}

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
  dotenv.config({ path: path.resolve(process.cwd(), '../.private/.env.secret') })
}

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env.test') })
  dotenv.config({ path: path.resolve(process.cwd(), '../.private/.env.secret') })
}

// REMOVE THIS LINE BEFORE GIT
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
dotenv.config({ path: path.resolve(process.cwd(), '../.private/.env.secret') })


import convict from 'convict';

export const config = convict({
 env: {
   format: ['production', 'development', 'test'],
   default: 'development',
   arg: 'nodeEnv',
   env: 'NODE_ENV'
 },
  fabbitProducer: {
      port: {
        doc: 'fabbit-producer port',
        format: Number,
        default: 1069,
        env: 'FABBIT_PRODUCER_PORT'
      }
  },
  apiWorker: {
    port: {
      doc: 'api-worker port',
      format: Number,
      default: 1070,
      env: 'API_WORKER_PORT'
    }
  },
  bull: {
      queues: {
        daily: {
          doc: 'Bull js daily jobs queue',
          format: String,
          default: 'daily',
          env: 'BULl_DAILY_QUEUE_NAME'
        },
        live: {
          doc: 'Bull js live polling queue for live stats',
          format: String,
          default: 'live',
          env: 'BULL_LIVE_QUEUE_NAME'
        },
        sms: {
          doc: 'Bull js SMS queue for mobile interaction',
          format: String,
          default: 'sms',
          env: 'BULL_SMS_QUEUE_NAME'
        }
      }
  },
  twilio: {
    apiKey: {
      doc: 'API key for twilio',
      format: String,
      default: undefined,
      env: 'TWILIO_API_KEY'
    },
    sid: {
      doc: 'twillio sender id',
      format: String,
      default: undefined,
      env: 'TWILIO_SID'
    },
    serviceId: {
      doc: 'twilio service id for TightShip project',
      format: String,
      default: undefined,
      env: 'TWILIO_APP_ID'
    }
  },
  redis: {
      host: {
        doc: 'Redis host',
        format: String,
        default: '127.0.0.1',
        env: 'REDIS_HOST'
      },
      port: {
        doc: 'Redis port',
        format: Number,
        default: 6379,
        env: 'REDIS_PORT'
      },
  },
  firebase: {
      apiKey: {
          doc: 'Firebase API key',
          format: String,
          default: undefined,
          env: 'FIREBASE_API_KEY'
      },
      databaseURL: {
        doc: 'Firebase database URL',
        format: String,
        default: undefined,
        env: 'FIREBASE_DATABASE_URL'
      },
      authDomain: {
          doc: 'Firebase Auth Domain',
          format: String,
          default: 'tightship-6fc33.firebaseapp.com',
          env: 'FIREBASE_AUTH_DOMAIN'
      },
      projectId: {
          doc: 'Firebase project ID',
          format: String,
          default: 'tightship-6fc33',
          env: 'FIREBASE_PROJECT_ID'
      },
      storageBucket: {
          doc: 'Firebase storage bucket',
          format: String,
          default: 'tightship-6fc33.appspot.com',
          env: 'FIREBASE_STORAGE_BUCKET'
      },
      storageBucket: {
        doc: 'Firebase messenger id',
        format: String,
        default: '1001928400741',
        env: 'FIREBASE_MESSENGER_ID'
      },
      appId: {
          doc: 'Firebase app ID',
          format: String,
          default: '1:1001928400741:web:5ede91ad3c13f95dbf8b8c',
          env: 'FIREBASE_APP_ID'
      },
      measurementId: {
          doc: 'Firebase measurement ID',
          format: String,
          default: 'G-S7GTZTN9SE',
          env: 'FIREBASE_MEASUREMENT_ID'
      }
  },
  postgres: {
    driver: {
        updateGeocode: {
          doc: 'whether to update all ATMs with a geocode upon ingestion',
          format: Boolean,
          default: false,
          env: 'PSQL_UPDATE_GEOCODE'
        }
    },
    connection: {
      user: {
        doc: 'Postgres user for Cloud SQL',
        format: String,
        default: 'postgres',
        env: 'PGUSER'
      },
      host: {
        doc: 'Postgres hostname for Cloud SQL',
        format: String,
        default: '127.0.0.1',
        env: 'PGHOST'
      },
      database: {
        doc: 'Postgres database for Cloud SQL',
        format: String,
        default: 'tightship',
        env: 'PGDATABASE'
      },
      port: {
        doc: 'Postgres port for Cloud SQL',
        format: String,
        default: '54321',
        env: 'PGPORT'
      },
      password: {
        doc: 'u know wut, u slut',
        format: String,
        default: 'dingdongbingbangboing',
        env: 'PGPASSWORD'
      }
    }
  },
  pai: {
    test: {
      username: {
        doc: 'username to use for testing PAI functionality',
        format: String,
        default: undefined,
        env: 'PAI_USERNAME'
      },
      password: {
        doc: 'password to use for testing PAI functionality',
        format: String,
        default: undefined,
        env: 'PAI_PASSWORD'
      },
    },
    mockClient: {
      doc: 'mock client to use for testing or not',
      format: Boolean,
      default: false,
      env: 'PAI_MOCK_CLIENT'
    }
  },
  logger: {
    levelOverride: {
      doc:'manually force the logger into a level: debug|info|warn|error',
      format: String,
      default: undefined,
      env: 'LOGGER_OVERRIDE'
    },
  },
  graphql: {
    networking: {
      port: {
        doc: 'port on which graphql will run',
        format: Number,
        default: 4000,
        env: 'GRAPHQL_PORT'
      }
    }
  },
  cherry: {
    format: String,
    default: 'from default',
    arg: 'cherry',
    env: 'CHERRY'
  }
});

export default { config};
