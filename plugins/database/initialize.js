let consume = require("pluginbot/effects/consume")
let {call, put} = require("redux-saga/effects")
let createTable = function(knex){
    return async function(tableName, tableFunction){
        let table = await knex.schema.createTable(tableName, tableFunction);
        console.log("Created table : " + tableName);
        return table
    }

}


//todo: split this up into multiple plugins.
let buildTables = async function(knex) {


        console.log("Creating tables...");
        let create = createTable(knex);

        await create('user_roles', function (table) {
            table.increments();
            table.string('role_name').unique();
            table.timestamps(true, true);

        });

        await create('user_permissions', function (table) {
            table.increments();
            table.string('permission_name').unique();
            table.timestamps(true, true);

        });
        await create('roles_to_permissions', function (table) {
            table.increments();
            table.integer('role_id').references('user_roles.id').onDelete('cascade');
            table.integer('permission_id').references('user_permissions.id').onDelete('cascade');
            table.timestamps(true, true);

        });
        await create('users', function (table) {
            table.increments();
            table.integer('role_id').references('user_roles.id');
            table.string('name');
            table.string('email').notNullable().unique();
            table.string('password');
            table.string('provider').defaultTo("local");
            table.enu('status', ['active', 'suspended', 'invited', 'flagged', 'disconnected']).defaultTo('active');
            table.string('customer_id');
            table.string('phone');
            table.timestamp('last_login');
            table.timestamps(true, true);

        });
        await create('funds', function (table) {
            table.increments();
            table.integer('user_id').references('users.id').onDelete('cascade');
            table.boolean('flagged').defaultTo(false);
            table.jsonb('source');
            table.timestamps(true, true);

        });
        await create('invitations', function (table) {
            table.increments();
            table.string('token');
            table.integer('user_id').references('users.id').onDelete('cascade');
            table.timestamps(true, true);

        });
        await create('system_options', function (table) {
            table.string('option').primary();
            table.string('value');
            table.boolean("public").defaultTo(false);
            table.string('type');
            table.string('data_type');
            table.timestamps(true, true);

        });
        await create('event_logs', function (table) {
            table.increments();
            table.integer('user_id');
            table.string('log_level');
            table.string('log_type');
            table.string('log');
            table.timestamps(true, true);

        });
        await create('files', function (table) {
            table.increments();
            table.integer('user_id').references('users.id').onDelete('cascade');
            table.string('path');
            table.integer('size');
            table.string('name');
            table.string('mimetype');
            table.timestamps(true, true);

        });
        await create('notification_templates', function (table) {
            table.increments();
            table.string('name');
            table.string('event_name');
            table.text('message', 'longtext');
            table.string('subject');
            table.string('description');
            table.string("model");
            table.specificType('additional_recipients', 'text[]');
            table.boolean("send_email").defaultTo(false);
            table.boolean("send_to_owner").defaultTo(true);
            table.boolean("create_notification").default(true);
            table.timestamps(true, true);

        });
        await create("notification_templates_to_roles", function (table) {
            table.increments();
            table.integer("notification_template_id").references("notification_templates.id");
            table.integer("role_id").references("user_roles.id");
            table.timestamps(true, true);

        });
        await create('notifications', function (table) {
            table.increments();
            table.string("source_id").unique();
            table.text('message', 'longtext');
            table.string("type");
            table.integer("user_id").references("users.id").onDelete('cascade');
            table.string("subject");
            table.string("affected_versions").defaultTo("*");
            table.boolean("read").defaultTo(false);
            table.boolean("email_delivered").defaultTo(false);
            table.boolean("email_read").defaultTo(false);
            table.timestamp('created_at').defaultTo(knex.fn.now());

        });
        await create('service_categories', function (table) {
            table.increments();
            table.string('name');
            table.string('description');
            table.timestamps(true, true);

        });
        await create('service_templates', function (table) {
            table.increments();
            table.integer('category_id').references('service_categories.id');
            table.integer('created_by').references('users.id');
            table.string('name').notNullable().unique();
            table.string('description');
            table.text('details', 'longtext');
            table.boolean('published').defaultTo(false);
            table.string('statement_descriptor');
            table.integer('trial_period_days');
            table.float('amount');
            table.float('overhead');
            table.string('currency').defaultTo('usd');
            table.string('interval');
            table.integer('interval_count').defaultTo(1);
            table.enu('type', ['subscription', 'one_time', 'custom', "split"]).defaultTo('subscription');
            table.boolean('subscription_prorate').defaultTo(true);
            table.jsonb('split_configuration');
            table.timestamps(true, true);

        });
        await create('service_instances', function (table) {
            table.increments();
            table.integer('service_id').references('service_templates.id');
            table.integer('user_id').references('users.id');
            table.integer('requested_by').references('users.id');
            table.jsonb('payment_plan');
            table.string('name');
            table.text('description', 'longtext');
            table.string('subscription_id');
            table.bigInteger('subscribed_at');
            table.bigInteger('trial_end');
            table.enu('status', ['running', 'requested', 'in_progress', 'waiting_cancellation', 'missing_payment', 'cancelled', 'completed']).defaultTo('missing_payment');
            table.enu('type', ['subscription', 'one_time', 'custom', "split"]).defaultTo('subscription');
            table.jsonb('split_configuration');
            table.timestamps(true, true);

        });
        await create('service_instance_messages', function (table) {
            table.increments();
            table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
            table.integer('user_id').references('users.id');
            table.string('message');
            table.timestamps(true, true);

        });
        await create('service_instance_cancellations', function (table) {
            table.increments();
            table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
            table.integer('user_id').references('users.id');
            table.enu('status', ['waiting', 'approved', 'rejected']).defaultTo('waiting');
            table.integer('fulfilled_by').references('users.id');
            table.timestamps(true, true);

        });
        await create('properties', function (table) {
            table.increments();
            table.string('name');
            table.string('type');
            table.jsonb('data');
            table.jsonb('config');
            table.string('prop_class');
            table.string('prop_label');
            table.string('prop_description');
            table.timestamps(true, true);

        });
        await create('service_template_properties', function (table) {
            //Inherits the properties table.
            table.inherits('properties');
            table.increments();
            table.integer('parent_id').references('service_templates.id').onDelete('cascade');
            table.boolean('private').defaultTo(false);
            table.boolean('prompt_user').defaultTo(true);
            table.boolean('required').defaultTo(false);
            table.timestamps(true, true);

        });
        await create('service_instance_properties', function (table) {
            //Inherits the properties table.
            table.inherits('properties');
            table.increments();
            table.integer('parent_id').references('service_instances.id').onDelete('cascade');
            table.boolean('private').defaultTo(false);
            table.boolean('prompt_user').defaultTo(true);
            table.boolean('required').defaultTo(false);
            table.timestamps(true, true);

        });
        await create('user_invoices', function (table) {
            table.increments();
            table.integer('user_id').references('users.id');
            table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
            table.string('invoice_id').unique();
            table.string('subscription');
            table.string('charge');
            table.string('description');
            table.float('amount_due');
            table.float('discount');
            table.integer('attempt_count');
            table.boolean('closed');
            table.string('currency');
            table.boolean('forgiven');
            table.bigInteger('date');
            table.bigInteger('next_attempt');
            table.boolean('paid');
            table.bigInteger('period_end');
            table.bigInteger('period_start');
            table.string('receipt_number');
            table.float('starting_balance');
            table.float('ending_balance');
            table.float('total');
            table.boolean('livemode');
            table.timestamps(true, true);

        });
        await create('charge_items', function (table) {
            table.increments();
            table.integer('user_id').references('users.id');
            table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
            table.boolean('approved').defaultTo(false);
            table.string('subscription_id');
            table.string('item_id');
            table.float('amount');
            table.string('currency').defaultTo('usd');
            table.string('description');
            table.bigInteger('period_start');
            table.bigInteger('period_end');
            table.timestamps(true, true);

        })
        await create('user_invoice_lines', function (table) {
            table.increments();
            table.integer('invoice_id').references('user_invoices.id').onDelete('cascade');
            table.string('line_item_id');
            table.float('amount');
            table.string('currency');
            table.string('description');
            table.boolean('proration');
            table.integer('quantity');
            table.string('type');
            table.boolean('livemode');
            table.timestamps(true, true);

        });
        await create('transactions', function (table) {
            table.increments();
            table.integer('invoice_id').references('user_invoices.id').onDelete('cascade');
            table.integer('user_id').references('users.id');
            table.string('charge_id');
            table.string('invoice');
            table.float('amount');
            table.boolean('refunded');
            table.float('amount_refunded');
            table.jsonb('refunds');
            table.boolean('captured');
            table.string('currency');
            table.string('dispute');
            table.boolean('paid');
            table.string('description');
            table.string('failure_code');
            table.string('failure_message');
            table.string('statement_descriptor');
            table.string('status');
            table.boolean('livemode');
            table.timestamps(true, true);

        });
        await create('user_upcoming_invoice', function (table) {
            table.increments();
            table.integer('user_id').references('users.id').onDelete('cascade');
            table.bigInteger('next_payment');
            table.jsonb('invoice_json');
            table.timestamps(true, true);
            console.log("Created 'user_upcoming_invoice' table.");

        });
        await create('password_reset_request', function (table) {
            table.increments();
            table.integer('user_id').references('users.id').onDelete('cascade');
            table.string('hash');
            table.timestamps(true, true);
        });

    console.log("***** All Tables successfully created *****");


};

module.exports = function*(database){
        yield call(buildTables, database);
};