
exports.up = function(knex) {
    return knex.schema
        .createTable('users', function(table) {
            table.increments().primary()
            table
                .string('uid', 255)
                .notNullable()
                .unique()
                .defaultTo('A3eKsIK93sHFj291Fhs1dsDs2oa6znL')
            table
                .string('display_name', 255)
                .notNullable()
                .defaultTo('Sung Bean')
            table
                .string('email', 255)
                .notNullable()
                .defaultTo('sungbean@YungstenSung.com')
            table
                .string('acct_type', 255)
                .notNullable()
                .defaultTo('premium')
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
            table.json('store')
        })
        .createTable('terminals', function(table) {
            table.increments().primary()
            table
                .string('terminal_id', 255)
                .unique()
                .notNullable()
            table.string('registered_owner', 255)
                .notNullable()
                .references('uid')
                .inTable('users')
                .onDelete('restrict')
            table.string('location_name', 255).notNullable()
            table.string('group', 255).notNullable()
            table.string('partner', 255).notNullable()
            table.string('address', 255).notNullable()
            table.string('city', 255).notNullable()
            table.string('state', 2).notNullable()
            table.integer('zip')
            table.decimal('lattitude')
            table.decimal('longitude')
            table.decimal('surcharge_amnt')
            table.timestamp('first_txn').defaultTo(knex.fn.now())
            table.timestamp('last_txn').defaultTo(knex.fn.now())
            table.timestamp('last_settled_txn').defaultTo(knex.fn.now())
            table.timestamp('db_created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
            table
                .boolean('active')
                .notNullable()
                .defaultTo(true)
            table.decimal('last_balance').defaultTo(0)
            table.json('store')
        })
        .createTable('terminal_errors', function (table) {
            table.increments().primary()
            table.string('terminal_id', 255)
            table.string('location_name', 255).notNullable()
            table.string('group', 255).notNullable()
            table.string('partner', 255).notNullable()
            table.string('address', 255).notNullable()
            table.string('city', 255).notNullable()
            table.string('state', 2).notNullable()
            table.integer('zip')
            table.timestamp('error_time').defaultTo(knex.fn.now())
            table.string('error_code', 255).notNullable()
            table.string('error_message', 255).notNullable()
        })
        .createTable('daily_atm', function(table) {
            table.increments().primary()
            table.string('terminal_id', 255)
                .notNullable()
                .references('terminal_id')
                .inTable('terminals')
                .onDelete('restrict');
            table
                .decimal('balance')
                .defaultTo(-1)
            table
                .boolean('operational')
                .notNullable()
                .defaultTo(true)
            table
                .timestamp('created_at')
                .defaultTo(knex.fn.now())
            table
                .timestamp('log_date')
                .notNullable()
            table
                .integer('total_txn')
                .notNullable()
                .defaultTo(0)
            table
                .integer('wd_txn')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('wd_amnt')
                .notNullable()
                .defaultTo(0)
            table
                .integer('nwd_txn')
                .notNullable()
                .defaultTo(0)    
            table
                .integer('envelope_deposit_txn')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('envelope_deposit_txn_amnt')
                .notNullable()
                .defaultTo(0)
            table
                .integer('check_deposit_txn')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('check_deposit_txn_amnt')
                .notNullable()
                .defaultTo(0)
            table
                .integer('cash_deposit_txn')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('cash_deposit_txn_amnt')
                .notNullable()
                .defaultTo(0)
            table
                .integer('deposit_txn')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('deposit_txn_amnt')
                .notNullable()
                .defaultTo(0)
            table
                .decimal('vault_amnt')
                .notNullable()
                .defaultTo(0)
            table.json('store')
        })
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('daily_atm')
        .dropTable('terminal_errors')
        .dropTable('terminals')
        .dropTable('users')
};
