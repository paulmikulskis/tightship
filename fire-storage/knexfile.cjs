const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') })
require('dotenv').config({ path: path.resolve(process.cwd(), '../.private/.env.secret') })

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host : process.env.PGHOST,
      user : process.env.PGUSER,
      password : process.env.PGPASSWORD,
      database : process.env.PGDATABASE,
      port: process.env.PGPORT,
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host : process.env.PGHOST,
      user : process.env.PGUSER,
      password : process.env.PGPASSWORD,
      database : process.env.PGDATABASE,
      port: process.env.PGPORT,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host : process.env.PGHOST,
      user : process.env.PGUSER,
      password : process.env.PGPASSWORD,
      database : process.env.PGDATABASE,
      port: process.env.PGPORT,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
