module.exports = {


    up: async function (knex) {
        await knex.schema.raw(`
    ALTER TABLE "service_instances"
    DROP CONSTRAINT "service_instances_status_check",
    ADD CONSTRAINT "service_instances_status_check" 
    CHECK (status IN ('running', 'requested', 'in_progress', 'waiting_cancellation', 'missing_payment', 'cancelled', 'completed', 'cancellation_pending'))`);

        return await knex;
    },

    down: async function (knex) {
        await knex.schema.raw(`
    ALTER TABLE "service_instances"
    DROP CONSTRAINT "service_instances_status_check",
    ADD CONSTRAINT "service_instances_status_check" 
    CHECK (status IN ('running', 'in_progress', 'waiting_cancellation', 'missing_payment', 'cancelled', 'completed'))`);
        return knex;
}
}