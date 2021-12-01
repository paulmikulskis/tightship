import { Postgres, Bully } from 'fire-storage';
import { subDays, addDays, format, formatISO9075 } from 'date-fns';


/**
 * helper function to take the default return from the daily_log relation from 
 * postgres (*), and destructure/rework that return value into a list of arrays 
 * of type DailyLog that the graphql schema can understand 
 * @param {[{}]} logs 
 */
const destructureDailyLogs = (logs) => {
    // check for undefined since this is helped function
    if (logs) {
        const logArray = logs.map(log => {
            return {
                terminalId: log.terminal_id,
                balance: log.balance,
                log_date: log.log_date,
                operational: log.operational,
                createdAt: log.created_at,
                totalTx: log.total_txn,
                wdTx: log.wd_txn,
                wdTxAmnt: log.wd_amnt,
                nwdTx: log.nwd_txn,
                envelopeDepositTx: log.envelope_deposit_txn,
                envelopeDepositTxAmnt: log.envelope_deposit_txn_amnt,
                checkDepositTx: log.check_deposit_txn,
                checkDepositTxAmnt: log.check_deposit_txn_amnt,
                cashDepositTx: log.cash_deposit_txn,
                cashDepositTxAmnt: log.cash_deposit_txn_amnt,
                depositTx: log.deposit_txn,
                depositTxAmnt: log.deposit_txn_amnt,
                vaultAmnt: log.vault_amnt,
                store: log.store
            };
        });
        //console.log('LOG ARRAY:', logArray)

        return logArray;
    } else return null;
}

/**
 * helper function to take the default return from the terminal_errors relation from 
 * postgres (*), and destructure/rework that return value into a list of arrays 
 * of type DailyLog that the graphql schema can understand 
 * @param {[{}]} logs 
 */
const destructureErrorLogs = (logs) => {
    return logs.map(log => {
        return {
            terminalId: log.terminal_id,
            group: log.group,
            marketPartner: log.partner,
            locationName: log.location_name,
            address: log.address,
            city: log.city,
            zip: log.zip,
            state: log.state,
            errorTime: new Date(log.error_time),
            errorCode: log.error_code,
            errorMessage: log.error_message
        };
    });
};

/**
 * 
 * @param {{parent, args}} _ parent information from root resolver
 * @param {*} param1 { uid } the user ID, required for the main entrypoint to the App
 * @param {*} ctx context
 * @returns uid
 */
const appResolver = async (_, { uid }, ctx) => { 
    // any functions related to setting up the app should go here
    return { uid };
};


const resolveUserTerminalInfo = async (uid) => {
    const terminals = await Postgres.getUserTerminals(Postgres.db, uid)
    const terms = terminals.map(t => {
        return {
            terminalId: t.terminal_id,
            registered_owner: t.registered_owner,
            locationName: t.location_name,
            group: t.group,
            partner: t.partner,
            address: t.address,
            city: t.city,
            state: t.state,
            zip: t.zip,
            lattitude: t.lattitude,
            longitude: t.longitude,
            surcharge_amnt: t.surcharge_amnt,
            first_txn: t.first_txn,
            last_txn: t.last_txn,
            last_settled_txn: t.last_settled_txn,
            lastBalance: t.last_balance,
            store: t.store
        };
    });
    //console.log(JSON.stringify(terms, null, 2))
    return terms
}


const terminalErrorLogsFunction = async (startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const errs = await Postgres.getUserTerminalErrors(Postgres.db, start, end, tid, uid);
    return destructureErrorLogs(errs);
}


const terminalAverages = async (startDate, endDate, dayOfWeek, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const averages = await Postgres.getTerminalAverages(
        Postgres.db,
        start,
        end,
        dayOfWeek,
        tid,
        uid
    );
    return averages;
};


const terminalTotals = async (startDate, endDate, dayOfWeek, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const totals = await Postgres.getTerminalTotals(
        Postgres.db,
        start,
        end,
        dayOfWeek,
        tid,
        uid
    );
    return totals;
};

const transactionsByDayFunction = async (startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const ret = await Promise.all([...Array(8).keys()].slice(1,).map( async (day) => {
        return await Postgres.getTerminalAverages(
            Postgres.db,
            start,
            end,
            day,
            undefined,
            uid
        );
    }))
    const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const reducedReturn = ret.reduce( (acc, curr, index, arr) => {
        const keyed = dayKey[index];
        return { ...acc, [keyed]: curr }
    }, {});

    //console.log(`Transactions By Day Function:\n${JSON.stringify(reducedReturn, null, 4)}`)
    return reducedReturn;
};


const dailyLogsFunction = async (startDate, endDate, dayOfWeek, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    //console.log(`startDate: ${startDate}, endDate: ${endDate}, tid: ${tid}`);
    const logs = await Postgres.getTerminalDailyLogs(
        Postgres.db,
        start, 
        end,
        dayOfWeek,
        tid,
        uid
    );
    //console.log('DAILY LOGS', logs)
    return destructureDailyLogs(logs);

};


const vaultingLogFunction = async (startDate, endDate, tid, uid) => {
    const start = startDate ? startDate : subDays(new Date(), 30);
    const end = endDate ? endDate : new Date();
    const days = await Postgres.getDailyLogsWithVault(
        Postgres.db,
        start, 
        end,
        tid,
        uid
    );
    //console.log('VAULTING DAYS:', days)
    return destructureDailyLogs(days)
}


const daysAtZero = async (startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const days = await Postgres.getDailyLogsWithZeroBalance(
        Postgres.db,
        start, 
        end,
        tid,
        uid
    );
    return destructureDailyLogs(days);
};


const terminalLogsRoot = async (startDate, endDate, dayOfWeek, tid, uid) => {
    return {
        daily: await dailyLogsFunction(startDate, endDate, dayOfWeek, tid, uid),
        vaulting: await vaultingLogFunction(startDate, endDate, tid, uid),
    };
};


const terminalStatsRoot = async (startDate, endDate, dayOfWeek, tid, uid) => {
    return {
        daysAtZero: await daysAtZero(startDate, endDate, tid, uid),
        averages: await terminalAverages(startDate, endDate, dayOfWeek, tid, uid),
        totals: await terminalTotals(startDate, endDate, dayOfWeek, tid, uid),
        transactionsByDay: await transactionsByDayFunction(startDate, endDate, tid, uid)
    };
};


const terminalErrorsRoot = async (startDate, endDate, tid, uid) => {
    const errors = await terminalErrorLogsFunction(startDate, endDate, tid, uid);
    //console.log('ERROR LOGS:', JSON.stringify(errors, null, 2))
    return {
        errorLog: errors
    }
};


export const resolvers = {

    // root Query
    Query: {
        app: appResolver,
    },
    // root Mutation
    Mutation: {
        app: appResolver,
    },

    // app functionality
    App: {
        accountID: async (parent, args, ctx, info) => {
            return ctx.user?.uid + '';
        },

        terminals: async (parent, args, ctx, info) => {
            // getting user info, argument sanitization
            var uid = args.uid;
            //uid = 'testUid_420';
            const dayOfWeek = args.dayOfWeek ? args.dayOfWeek : undefined;
            const dailyLogsStartDate = args.dailyLogsStartDate ? new Date(args.dailyLogsStartDate) : subDays(new Date(), 7);
            const dailyLogsEndDate = args.dailyLogsEndDate ? new Date(args.dailyLogsEndDate) : new Date();
            const errorLogsStartDate = args.errorLogsStartDate ? new Date(args.errorLogsStartDate) : subDays(new Date(), 2);
            const errorLogsEndDate = args.errorLogsEndDate ? new Date(args.errorLogsEndDate) : new Date();
            const statsStartDate = args.statsStartDate ? new Date(args.statsStartDate) : subDays(new Date(), 7);
            const statsEndDate = args.statsEndDate ? new Date(args.statsEndDate) : new Date();
            const tid = args.tid;
            // the actual terminals resolver:
            return {
                logs: terminalLogsRoot(dailyLogsStartDate, dailyLogsEndDate, dayOfWeek, tid, uid),
                info: resolveUserTerminalInfo(uid),
                stats: terminalStatsRoot(statsStartDate, statsEndDate, dayOfWeek, tid, uid),
                errors: terminalErrorsRoot(errorLogsStartDate, errorLogsEndDate, tid, uid)
            };
        },
    },
    AppMutate: {
        accountID: async (parent, args, ctx, info) => {
            return ctx.user?.uid + '';
        },

        sendEmails: async (parent, args, ctx, info) => {
            var uid = args.uid;
            //uid = 'testUid_420';
            console.log(`will be sending emails to ${args.addresses} [NOT YET IMPLEMENTED!]`);
            return true;
        },

        sendSMSVaultPlan: async (parent, args, ctx, info) => {
            var uid = args.uid;
            //uid = 'testUid_420';
            console.log('abount to enqueue SMS request')
            await Bully.enqueueSMSVaultPlan(args)
            console.log(`graphql queuing into Bull to send SMS's to ${args.numbers}`);
            return true;
        },
    }

};

export default resolvers;
