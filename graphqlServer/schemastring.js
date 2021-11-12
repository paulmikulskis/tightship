import { gql } from 'apollo-server';
export const typeDefs = gql`

scalar JSON
scalar Date


type Query {
  app(uid: String!): App
}

type Mutation {
  hello: String
}

type Terminal {
  terminalId: String
  registered_owner: String
  location_name: String
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
  last_balance: Float
  store: JSON
}

type QuickStats {
  daysAtZero: Int
  todaysWDAmnt: Int
  weekRevenue: Float
  # revenue difference from last week
  weekRevenueDifference: Float
}

type mainDashboardData {
  message: String
  #quickStats: QuickStats
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

type AtmLogs {
  daily: [DailyLog]
  vaulting: [DailyLog]
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

type AtmStats {
  daysAtZero: [DailyLog]
  averages: [AtmStat]
  totals: [AtmStat]
}

type App {
  # All the main endpoints for the app:
  accountID: String!
  terminals: [Terminal]!
  mainDashboardData: mainDashboardData
  logs(startDate: Date, endDate: Date, tid: String, uid: String!): AtmLogs
  atmStats(startDate: Date, endDate: Date, tid: String, uid: String!): AtmStats
}



`;
