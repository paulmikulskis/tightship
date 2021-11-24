import { gql } from 'apollo-server';
export const typeDefs = gql`

scalar JSON
scalar Date


type Query {
  app(uid: String!): App
}

type Mutation {
  app(uid: String!): AppMutate
}

type Terminals {
  logs: AtmLogs
  info: [Terminal]
  stats: AtmStats
  errors: AtmErrors
}

type AtmLogs {
  daily: [DailyLog]
  vaulting: [DailyLog]
}

type DailyLog {
  terminalId: String!
  log_date: Date
  balance: Float
  operational: Boolean
  createdAt: Date
  totalTx: Int
  wdTx: Int
  wdTxAmnt: Float
  nwdTx: Int
  envelopeDepositTx: Int
  envelopeDepositTxAmnt: Float
  checkDepositTx: Int
  checkDepositTxAmnt: Float
  cashDepositTx: Int
  cashDepositTxAmnt: Float
  depositTx: Int
  depositTxAmnt: Float
  vaultAmnt: Float
  store: JSON
}

type Terminal {
  terminalId: String
  registered_owner: String
  locationName: String
  group: String
  partner: String
  address: String
  city: String
  state: String
  zip: String
  lattitude: Float
  longitude: Float
  surcharge_amnt: Float
  first_txn: Date
  last_txn: Date
  last_settled_txn: Date
  lastBalance: Float
  store: JSON
}

type AtmStats {
  daysAtZero: [DailyLog]
  averages: [AtmStat]
  totals: [AtmStat]
  transactionsByDay: DailyAverage
}

type DailyAverage {
  monday: [AtmStat]
  tuesday: [AtmStat]
  wednesday: [AtmStat]
  thursday: [AtmStat]
  friday: [AtmStat]
  saturday: [AtmStat]
  sunday: [AtmStat]
}

type AtmStat {
  terminalId: String!
  locationName: String
  lattitude: Float
  longitude: Float
  surchargeAmnt: Float
  totalTx: Float
  balance: Float
  wdTx: Float
  wdTxAmnt: Float
  nwdTx: Float
  envelopeDepositTx: Float
  envelopeDepositTxAmnt: Float
  checkDepositTx: Float
  checkDepositTxAmnt: Float
  cashDepositTx: Float
  cashDepositTxAmnt: Float
  depositTx: Float
  depositTxAmnt: Float
  vaultAmnt: Float
}

type AtmErrors {
  errorLog: [AtmError]
}

type AtmError {
  terminalId: String!
  group: String
  marketPartner: String
  locationName: String
  address: String
  city: String
  state: String
  zip: String
  errorTime: Date
  errorCode: String
  errorMessage: String
}

type App {
  # All the main endpoints for the app:
  accountID: String!
  terminals(
    errorLogsStartDate: Date, 
    errorLogsEndDate: Date, 
    statsStartDate: Date,
    statsEndDate: Date,
    dailyLogsStartDate: Date,
    dailyLogsEndDate: Date,
    dayOfWeek: Int,
    tid: String, 
    uid: String!
  ): Terminals
}

# mutations below --------------

type AppMutate {
  accountID: String!
  sendEmails(uid: String!, addresses: [String]!, subject: String!, body: String!): Boolean!
  sendSMSVaultPlan(uid: String!, vaulterNames: [String], numbers: [String]!, terminals: [String]!, amounts: [Int]!, date: Date, message: String, sendTime: String): Boolean!
}



`;
