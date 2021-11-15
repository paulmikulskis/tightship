import { config } from 'tightship-config';
import knex from 'knex'
import Nominatim from 'nominatim-geocoder';
import { logger } from '../papi/logger.js'
import { subDays, addDays, format, formatISO9075 } from 'date-fns';

// used when checking the return types of certain dictionaries
// that are assumed to be mostly numeric
const nonNumericFields = [
  'terminalId',
  'locationName',
  'lattitude',
  'longitude',
  'surchageAmnt',
]


const geocoder = new Nominatim({
  delay: 1000, // delay between requests
  secure: false, // disables ssl
  host:'nominatim.openstreetmap.org',
  //customUrl: 'http://your-own-nominatim/',
  });


export const db = knex({
  client: 'pg',
  connection: {
    host : config.get('postgres.connection.host'),
    user : config.get('postgres.connection.user'),
    password : config.get('postgres.connection.password'),
    database : config.get('postgres.connection.database'),
    port: config.get('postgres.connection.port'),
  }
  });


export const rawQuery = async(queryString) => {
  try {
    return await db.raw(queryString);
  } catch (err) {
    logger.error('query error:\n', err)
    return undefined;    
  }
}


export const userExists = async (driver, uid) => {
  try {
    const result = await driver.select('uid').from('users').where('uid', uid);
    return result.length > 0 ? result[0] : undefined;
  } catch (err) {
    logger.error(`query error: for userExists on uid=${uid}\n`, err)
    return undefined;
  }
  };


export const createUser = async (driver, uid, displayName, email, acct_type, store={}) => {
  logger.info(`starting create user for ${email}`);
  try {
    return await driver
      .insert({
        uid,
        display_name: displayName,
        email,
        acct_type,
        store
      })
      .into('users')
      .returning('*')
      .then((rows) => {
        logger.info(`createUser for ${email} uid=${uid}`)
        return rows[0];
      });
  } catch (err) {
    logger.error(`error inserting user document for ${email}`, err)
    return undefined;
  };
  };


export const getTerminalAverages = async (driver, startDate, endDate, tid, uid) => {
  console.log(`tid=${tid}, startDate=${startDate}, endDate=${endDate}`)
  const logs = await getTerminalDailyLogs(driver, startDate, endDate, tid, uid);
  const atms = await getUserTerminals(driver, uid)
  if (!logs || !atms) {
    return []
  };
  // construct a new array which is a unique set of terminal_ids,
  // which we then map to an array of AtmStat types for GraphQL
  return [...new Set(
    logs.map((log) => {
      return log.terminal_id
    })
  )]
  .map(terminal_id => {
    const ls = logs.filter((log) => log.terminal_id==terminal_id);
    const at = atms.filter((a) => a.terminal_id==terminal_id)[0];
    //console.log(`LS for ${terminal_id}, ${ls.map(l => JSON.stringify(l, null, 2))}`)
    const ret = {
      terminalId: terminal_id,
      locationName: at.location_name,
      lattitude: at.lattitude,
      longitude: at.longitude,
      surchageAmnt: at.surcharge_amnt,
      totalTx: ls.map(log => log.total_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      balance: ls.map(log => log.balance).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      wdTx: ls.map(log => log.wd_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      wdTxAmnt: ls.map(log => log.wd_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      nwdTx: ls.map(log => log.nwd_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      envelopeDepositTx: ls.map(log => log.envelope_deposit_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      envelopeDepositTxAmnt: ls.map(log => log.envelope_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      checkDepositTx: ls.map(log => log.check_deposit_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      checkDepositTxAmnt: ls.map(log => log.check_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      cashDepositTx: ls.map(log => log.cash_deposit_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      cashDepositTxAmnt: ls.map(log => log.cash_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      depositTx: ls.map(log => log.deposit_txn).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      depositTxAmnt: ls.map(log => log.deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
      vaultAmnt: ls.map(log => log.vault_amnt).reduce((a,b) => (a + parseFloat(b))) / ls.length,
    };
    // in case there was an error in the logs, we still need to make sure
    // that the 'NaN' from NodeJS gets turned into a datatype that can be converted
    // to a float, since every 'averages' fieldtype in GraphQL schema is type Float
    Object.keys(ret).map( (key, index)  => {
      if (
        (parseFloat(ret[key]).toString() === 'NaN') &&
        (nonNumericFields.indexOf(key) < 0)
        ) {
        ret[key] = null;
      };
    });
    return ret;
  });
};


export const getTerminalTotals = async (driver, startDate=subDays(new Date(), 7), endDate=new Date(), tid, uid) => {
  //console.log(`tid=${tid}, startDate=${startDate}, endDate=${endDate}`)
  const logs = await getTerminalDailyLogs(driver, startDate, endDate, tid);
  const atms = await getUserTerminals(driver, uid)
  if (!logs) {
    return []
  }
  // construct a new array which is a unique set of terminal_ids,
  // which we then map to an array of AtmStat types for GraphQL
  //console.log(logs)
  return [...new Set(
    logs.map((log) => {
      return log.terminal_id
    })
  )]
  .map(terminal_id => {
    const ls = logs.filter((log) => log.terminal_id==terminal_id);
    const at = atms.filter((a) => a.terminal_id==terminal_id)[0];
    //console.log(`LS for ${terminal_id}, ${ls.map(l => JSON.stringify(l, null, 2))}`)
    const ret = {
      terminalId: terminal_id,
      locationName: at.location_name,
      lattitude: at.lattitude,
      longitude: at.longitude,
      surchageAmnt: at.surcharge_amnt,
      totalTx: ls.map(log => log.total_txn).reduce((a,b) => (a + parseFloat(b))),
      balance: ls.map(log => log.balance).reduce((a,b) => (a + parseFloat(b))),
      wdTx: ls.map(log => log.wd_txn).reduce((a,b) => (a + parseFloat(b))),
      wdTxAmnt: ls.map(log => log.wd_amnt).reduce((a,b) => (a + parseFloat(b))),
      nwdTx: ls.map(log => log.nwd_txn).reduce((a,b) => (a + parseFloat(b))),
      envelopeDepositTx: ls.map(log => log.envelope_deposit_txn).reduce((a,b) => (a + parseFloat(b))),
      envelopeDepositTxAmnt: ls.map(log => log.envelope_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))),
      checkDepositTx: ls.map(log => log.check_deposit_txn).reduce((a,b) => (a + parseFloat(b))),
      checkDepositTxAmnt: ls.map(log => log.check_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))),
      cashDepositTx: ls.map(log => log.cash_deposit_txn).reduce((a,b) => (a + parseFloat(b))),
      cashDepositTxAmnt: ls.map(log => log.cash_deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))),
      depositTx: ls.map(log => log.deposit_txn).reduce((a,b) => (a + parseFloat(b))),
      depositTxAmnt: ls.map(log => log.deposit_txn_amnt).reduce((a,b) => (a + parseFloat(b))),
      vaultAmnt: ls.map(log => log.vault_amnt).reduce((a,b) => (a + parseFloat(b))),
    };
    // in case there was an error in the logs, we still need to make sure
    // that the 'NaN' from NodeJS gets turned into a datatype that can be converted
    // to a float, since every 'averages' fieldtype in GraphQL schema is type Float
    Object.keys(ret).map( (key, index)  => {
      if (
        (parseFloat(ret[key]).toString() === 'NaN') &&
        (nonNumericFields.indexOf(key) < 0)
        ) {
          console.log(`setting return value ${key}:${ret[key]} to ${null}`)
        ret[key] = null;
      };
    });
    return ret;
  });
};


export const getUserTerminals = async (driver, uid) => {
  logger.debug(`getting all terminals for user ${uid}`);
  try {
    const result = await driver.select('*').from('terminals').where('registered_owner', uid);
    logger.debug('finished terminal query', result.map(item => item.terminal_id))
    return result;
  } catch (err) {
    logger.error(`query error: for getUserTerminals on uid=${uid}\n`, err)
    return undefined;
  }  
  };


export const getDailyLogsWithVault = async (driver, startDate=subDays(new Date(), 28), endDate=new Date(), tid=undefined, uid) => {
  logger.debug(
    `getting days that terminal ${tid==undefined ? "[ALL TERMINALS]" : tid} was vaulted between ${format(startDate, 'MM/dd/yyyy')} and ${format(endDate, 'MM/dd/yyyy')}`
    );
  try {
    const result = await driver
      .select('*')
      .from('daily_atm')
      .modify( (thisQuery) => {
        if (tid) {
          return thisQuery.where('terminal_id', tid);
        } else return thisQuery
      })
      .whereBetween('log_date', [startDate, endDate])
      .where('vault_amnt', '>', 0)
    logger.debug('finished getDailyLogsWithVault query', result.map(item => item.terminal_id))
    return result;
  } catch (err) {
    logger.error(`query error: for getDailyLogsWithVault on terminal_id=${tid}\n`, err)
    return undefined;
  }
}


export const getTerminalErrors = async (driver, tid=undefined, datetime=undefined) => {
  logger.debug(`getting terminal error for terminal ${tid}`);
  try {
    const result = await driver
      .select("*")
      .from('terminal_errors')
      .modify( (thisQuery) => {
        if (datetime) {
          thisQuery.where('error_time', '>=', datetime);
        }
      })
      .modify( (thisQuery) => {
        if (tid) {
          thisQuery.where('terminal_id', tid);
        }
      })
      .orderBy('error_time', 'desc')
    return result
  } catch (err) {
    logger.error(`query error for getTerminalError for terminal ${tid}, \n${err}`)
    return undefined;
  }
};


export const getUserTerminalErrors = async (driver, startDate=subDays(new Date(), 7), endDate=new Date(), tid=undefined, uid) => {
  logger.debug(`getting terminal error for user ${uid}`);
  try {
    const result = await driver
      .select("*")
      .from('terminal_errors')
      .whereBetween('error_time', [startDate, endDate])
      .modify( (thisQuery) => {
        if (tid) {
          thisQuery.where('terminal_id', tid);
        }
      })
      .orderBy('error_time', 'desc')
    return result
  } catch (err) {
    logger.error(`query error for getUserTerminalErrors for user ${uid}, \n${err}`)
    return undefined;
  }
}


export const createTerminalError = async (
    driver,
    terminal_id,
    group,
    partner,
    location,
    address,
    city,
    state,
    zip,
    error_time,
    error_code,
    error_message
  ) => {
    try {
      return driver
        .insert({
          terminal_id,
          location_name: location,
          group,
          partner,
          address,
          city,
          state,
          zip,
          error_time,
          error_code,
          error_message, 
        })
        .into('terminal_errors')
        .returning('*')
        .then((rows) => {
          return rows[0];
        });
    } catch (err) {
      logger.error(`error inserting terminal error log for terminal ${terminal_id}, \n${err}`)
      return undefined;
    };
};


export const getDailyLogsWithZeroBalance = async (driver, startDate=subDays(new Date(), 7), endDate=new Date(), tid=undefined, uid) => {
  logger.debug(
    `getting days that terminal ${tid==undefined ? "[ALL TERMINALS]" : tid} was at zero between ${format(startDate, 'MM/dd/yyyy')} and ${format(endDate, 'MM/dd/yyyy')}`
    );
  try {
    const result = await driver
      .select('*')
      .from('daily_atm')
      .modify( (thisQuery) => {
        if (tid) {
          thisQuery.where('terminal_id', tid);
        }
      })  
      .whereBetween('log_date', [startDate, endDate])
      .where('balance', '<', 1)
    logger.debug('finished getDailyLogsWithZeroBalance query', result.map(item => item.terminal_id))
    return result;
  } catch (err) {
    logger.error(`query error: for getDailyLogsWithZeroBalance on terminal_id=${tid}\n`, err)
    return undefined;
  }
}


export const getTerminalDailyLogs = async (driver, startDate=subDays(new Date(), 7), endDate=new Date(), tid=undefined, uid) => {
  logger.debug(
    `getting terminal logs for ${tid==undefined ? "[ALL TERMINALS]" : tid} from ${format(startDate, 'MM/dd/yyyy')}-${format(endDate, 'MM/dd/yyyy')}`
    );
  try {
    const result = await driver
      .select('*')
      .from('daily_atm')
      .modify( (thisQuery) => {
        if (tid) {
          thisQuery.where('terminal_id', tid);
        }
      })
      .whereBetween( 'log_date', [startDate, endDate] )
    logger.debug('finished getTerminalDailyLogs query', [...new Set(result.map(item => item.terminal_id))])
    // /console.log(result)
    return result;
  } catch (err) {
    logger.error(`query error: for getTerminalDailyLogs on terminal_id=${tid}\n`, err)
    return undefined;
  }  
  };


export const terminalExists = async (driver, tid) => {
  try {
    const result = await driver.select('*').from('terminals').where('terminal_id', tid);
    return result.length > 0 ? result[0] : undefined;
  } catch (err) {
    logger.error(`query error: for terminalExists on uid=${uid}\n`, err)
    return undefined;
  }
  };


export const createTerminal = async (
  driver,
  terminal_id,
  surcharge_amnt,
  registered_owner, // <- ForeignKey (UID)
  location_name,
  group,
  partner,
  address,
  city,
  state,
  zip,
  first_txn=new Date(),
  active=true,
  last_balance) => {


    const { lattitude, longitude } = await geocoder.search( { q: `${address.split(',')[0]}, ${city}, ${zip}` } )
      .then((response) => {
          logger.debug(`geocode for terminal ${terminal_id}: ${response[0].lat},${response[0].lon}`)
          return { lattitude: response[0].lat, longitude: response[0].lon }
      })
      .catch((error) => {
          logger.error(`unable to geocode atm at ${location_name}, query="${address.split(',')[0]}, ${city}, ${zip}":`, error)
      });

    try {
      return driver
        .insert({
          terminal_id,
          surcharge_amnt,
          registered_owner, // <- ForeignKey (UID)
          location_name,
          group,
          partner,
          address,
          city,
          state,
          zip,
          lattitude,
          longitude,
          first_txn,
          active,
          last_balance,
          store: {}
        })
        .into('terminals')
        .returning('*')
        .then((rows) => {
          return rows[0];
        });
    } catch (err) {
      logger.error(`error inserting user document for terminal ${terminal_id}`)
      return undefined;
    };
    

  };


export const updateTerminal = async (
  driver,
  terminal_id,
  surcharge_amnt,
  location_name,
  group,
  partner,
  address,
  city,
  state,
  zip,
  active=true,
  last_balance) => {

    const coords = { lattitude: undefined, longitude: undefined }
    // skipping geocoding updates for now since shit's slow cuz rate limiter
    // need to accomplish trello.com/c/zAiQ5BBw/1-enable-nominatum-parallel-geocoding
    if (config.get('postgres.driver.updateGeocode')) {
      coords = await geocoder.search( { q: `${address}, ${city}, ${zip}` } )
        .then((response) => {
            return { lattitude: response.lat, longitude: response.lon }
        })
        .catch((error) => {
            logger.error(`unable to geocode atm at ${location_name}:`, error)
        });
    };
    

    try {
      return driver('terminals')
        .where({ terminal_id })
        .update({ 
          surcharge_amnt,
          location_name,
          group,
          partner,
          address,
          city,
          state,
          zip,
          lattitude: coords.lattitude,
          longitude: coords.longitude,
          active,
          last_balance
         })
        .returning('*')
        .then((rows) => {
          return rows[0];
        });
    } catch (err) {
      logger.error(`error udating psql terminal document for terminal ${terminal_id}`)
      return undefined;
    };
    

  };


export const lastDailyLogDate = async (driver, terminal_id) => {
  try {
    const result = await driver
      .select('log_date')
      .from('daily_atm')
      .where('terminal_id', terminal_id)
      .orderBy('created_at', 'desc')
      .limit(1)
    return result[0];
  } catch (err) {
    logger.error('psql query error:\n', err)
    return undefined;
  }
  };


export const createDailyLog = async (
  driver, 
  terminal_id,  // <- ForeignKey
  balance,
  operational,
  log_date,
  total_txn,
  wd_txn,
  wd_amnt,
  nwd_txn,
  envelope_deposit_txn,
  envelope_deposit_txn_amnt,
  check_deposit_txn,
  check_deposit_txn_amnt,
  cash_deposit_txn,
  cash_deposit_txn_amnt,
  deposit_txn,
  deposit_txn_amnt,
  vault_amnt,
  store={}
  // Could we deconstruct here ^^? Yes.  Did I want to?  No.  Clarity is good.  
  ) => {
    log_date = new Date(log_date);
    const created_at = new Date();
    try {
      return driver
        .insert({
          terminal_id, // <- ForeignKey
          balance,
          operational,
          created_at,
          log_date,
          total_txn,
          wd_txn,
          wd_amnt,
          nwd_txn,
          envelope_deposit_txn,
          envelope_deposit_txn_amnt,
          check_deposit_txn,
          check_deposit_txn_amnt,
          cash_deposit_txn,
          cash_deposit_txn_amnt,
          deposit_txn,
          deposit_txn_amnt,
          vault_amnt,
          store
        })
        .into('daily_atm')
        .returning('*')
        .then((rows) => {
          return rows[0];
        });
    } catch (err) {
      logger.error(`error inserting daily_atm document for terminal ${terminal_id}, ${err}`)
      return undefined;
    };
  };
