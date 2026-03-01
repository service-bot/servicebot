let consume = require("pluginbot/effects/consume");
let { call } = require("redux-saga/effects");

/**
 * PayTheFly crypto payment gateway plugin for ServiceBot.
 *
 * Supports BSC (chainId=56, 18 decimals) and TRON (chainId=728126428, 6 decimals).
 * Configuration is read from environment variables or system_options table.
 *
 * Required env vars:
 *   PAYTHEFLY_PROJECT_ID  - PayTheFly project identifier
 *   PAYTHEFLY_PROJECT_KEY - HMAC-SHA256 key for webhook verification
 *   PAYTHEFLY_CHAIN_ID    - Blockchain chain ID (56 for BSC, 728126428 for TRON)
 *   PAYTHEFLY_TOKEN_ADDRESS - Payment token contract address
 */
let run = function* (config, provide, services) {
    let database = yield consume(services.database);

    let routeDefinition = [
        require("./api/webhook")(database),
        require("./api/create-order")(database),
        require("./api/order-status")(database),
    ];

    // Create PayTheFly orders table if not exists
    yield call(database.createTableIfNotExist, "paythefly_orders", function (table) {
        table.increments();
        table.string("serial_no").unique().notNullable();
        table.integer("user_id").references("users.id");
        table.integer("service_instance_id").references("service_instances.id").nullable();
        table.string("amount").notNullable();
        table.string("currency").defaultTo("USDT");
        table.integer("chain_id").defaultTo(56);
        table.bigInteger("deadline").notNullable();
        table.string("status").defaultTo("pending");
        table.string("tx_hash").nullable();
        table.string("wallet").nullable();
        table.string("paid_value").nullable();
        table.timestamps(true, true);
        console.log("Created 'paythefly_orders' table.");
    });

    // Create PayTheFly event logs table
    yield call(database.createTableIfNotExist, "paythefly_event_logs", function (table) {
        table.inherits("event_logs");
        table.string("event_id");
        console.log("Created 'paythefly_event_logs' table.");
    });

    yield provide({ routeDefinition });
};

module.exports = { run };
