module.exports = {


    up: async function (knex) {
        let ServiceTemplate = require("../../../../models/base/entity")("service_templates", [], "id", knex);

        await knex.schema.createTable("tiers", table => {
            table.increments();
            table.string("name").notNullable();
            table.specificType('features', 'text[]').defaultTo("{}");
            table.integer('service_template_id').notNullable().references('service_templates.id').onDelete("cascade");
            table.unique(['service_template_id', "name"]);
            table.timestamps(true, true);
        });
        await knex.schema.createTable("payment_structure_templates", table => {
            table.increments();
            table.integer('tier_id').references('tiers.id').onDelete('cascade');;
            table.integer('trial_period_days');
            table.bigInteger('amount');
            table.enu('type', ['subscription', 'one_time', 'custom', "split"]).defaultTo('subscription');
            table.string('currency').defaultTo('usd');
            table.string('interval');
            table.integer('interval_count').defaultTo(1);
            table.boolean('subscription_prorate').defaultTo(true);
            table.string('statement_descriptor');
            table.jsonb('split_configuration');
            table.timestamps(true, true);
        });

        let templates = await ServiceTemplate.find();
        let tiers = templates.map(template => {
            return {
                name: template.data.name + "-tier",
                service_template_id: template.data.id
            }
        });

        let createdTiers = await knex("tiers").insert(tiers).returning("*") || [];
        let templateMap = templates.reduce((acc, template) => {
            acc[template.data.id] = template.data;
            return acc;
        }, {});
        let paymentTemplates = createdTiers.map(tier => {
            let template = templateMap[tier.service_template_id];
            return {
                amount: template.amount,
                trial_period_days: template.trial_period_days,
                currency: template.currency,
                interval: template.interval,
                interval_count: template.interval_count,
                subscription_prorate: template.subscription_prorate,
                statement_descriptor: template.statement_descriptor,
                split_configuration: template.split_configuration,
                tier_id: tier.id,
                type: template.type
            }
        });
        let createdPayments = await knex("payment_structure_templates").insert(paymentTemplates);
        await knex.schema.alterTable("service_templates", table => {
            table.dropColumns("description", "type", "overhead", "details", "amount", "currency", "interval", "interval_count", "split_configuration", "statement_descriptor", "trial_period_days", "subscription_prorate")
        });
        await knex.schema.alterTable("service_instances", table => {
            table.integer('payment_structure_template_id').references('payment_structure_templates.id');
        });
        return await knex;
    },

    down: async function (knex) {
        let paymentStructures = await knex("payment_structure_templates").select();
        let tiers = await knex("tiers").select();
        await knex.schema.alterTable("service_templates", table => {
            table.integer('trial_period_days');
            table.float('amount');
            table.string('currency').defaultTo('usd');
            table.string('interval');
            table.string('description');
            table.text('details', 'longtext');
            table.integer('interval_count').defaultTo(1);
            table.boolean('subscription_prorate').defaultTo(true);
            table.string('statement_descriptor');
            table.float('overhead');
            table.jsonb('split_configuration');
            table.enu('type', ['subscription', 'one_time', 'custom', "split"]).defaultTo('subscription');

        });
        await knex.schema.alterTable("service_instances", table => {
            table.dropColumns('payment_structure_template_id');
        });
        for (let struct of paymentStructures) {
            let service_template_id = tiers.find(tier => tier.id === struct.tier_id).service_template_id;
            delete struct.id;
            delete struct.tier_id;
            await knex("service_templates").update(struct).where("id", service_template_id);
        }
        await knex.schema.dropTable("payment_structure_templates");
        await knex.schema.dropTable("tiers");

    }
}