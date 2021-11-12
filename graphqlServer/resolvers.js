import { Postgres, Bully } from 'fire-storage';
import { subDays, addDays, format, formatISO9075 } from 'date-fns';


/**
 * helper function to take the default return from postgres (*), and
 * destructure/rework that return value into a list of arrays of type DailyLog
 * that the graphql schema can understand 
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
        return logArray;
    } else return null;
}

const appResolver = async (_, { uid }, ctx) => { 
    // any functions related to setting up the app should go here
    return { uid };
};

const terminalAverages = async (tid, startDate, endDate, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const averages = await Postgres.getTerminalAverages(
        Postgres.db,
        start,
        end,
        tid,
        uid
    );
    return averages;
};


const terminalTotals = async (startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const totals = await Postgres.getTerminalTotals(
        Postgres.db,
        start,
        end,
        tid,
        uid
    );
    return totals;
};


const dailyLogsFunction = async (startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    console.log(`startDate: ${startDate}, endDate: ${endDate}, tid: ${tid}`);
    const logs = await Postgres.getTerminalDailyLogs(
        Postgres.db,
        start, 
        end,
        tid,
        uid
    );
    return destructureDailyLogs(logs);

};


const vaultingLogFunction = async (tid, startDate, endDate, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const days = await Postgres.getDailyLogsWithVault(
        Postgres.db,
        start, 
        end,
        tid,
        uid
    );
    return destructureDailyLogs(days)
}


const daysAtZero = async(startDate, endDate, tid, uid) => {
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate) : new Date();
    const days = await Postgres.getDailyLogsWithZeroBalance(
        Postgres.db,
        start, 
        end,
        tid,
        uid
    );
    return destructureDailyLogs(days)
}

export const resolvers = {

    // root Query
    Query: {
        app: appResolver,
    },
    // root Mutation
    Mutation: {
        hello: () => {
            return 
        }
    },

    // app functionality
    App: {
        accountID: async (parent, args, ctx, info) => {
            return ctx.user?.uid + '';
        },

        logs: async (parent, args, ctx, info) => {
            // pass entire functions in the logs resolver,
            // and access the arguments for the endpoint with `parent`
            var uid = ctx.user?.uid;
            uid = 'testUid_420'
            return {
                daily: await dailyLogsFunction(
                    args.startDate,
                    args.endDate, 
                    args.terminal_id,
                    uid
                ),
                vaulting: await vaultingLogFunction(
                    args.terminal_id,
                    args.startDate,
                    args.endDate, 
                    uid
                )
            };
        },

        atmStats: async (parent, args, ctx, info) => {
            var uid = ctx.user?.uid;
            uid = 'testUid_420'
            return {
                daysAtZero: await daysAtZero(
                    args.startDate,
                    args.endDate,
                    args.terminal_id,
                    uid
                ),
                
                averages: await terminalAverages(
                    args.startDate,
                    args.endDate,
                    args.terminal_id,
                    uid
                ),

                totals: await terminalTotals(
                    args.startDate,
                    args.endDate,
                    args.terminal_id,
                    uid
                ),
            }
        },

        terminals: async (parent, args, ctx, info) => {
            var uid = ctx.user?.uid;
            uid = 'testUid_420'
            const terminals = await Postgres.getUserTerminals(Postgres.db, uid)
            const terms = terminals.map(t => {
                return {
                    terminalId: t.terminal_id,
                    registered_owner: t.registered_owner,
                    location_name: t.location_name,
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
                    last_balance: t.last_balance,
                    store: t.store
                };
            });
            return terms
        },

        mainDashboardData: async (parent, args, ctx, info) => {
            return { message: 'main dashboard stat calculations' };
        },
    },

};

export default resolvers;
