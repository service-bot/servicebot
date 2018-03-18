module.exports = {
    up: function (knex) {
        console.log("migrating database to version 0.9");
        return knex.schema.alterTable("service_templates", t => {
            t.jsonb('split_configuration');
        }).then(subscriptions => {
            return knex.schema.alterTable("service_instances", t => {
                t.jsonb('split_configuration');
                t.bigInteger('trial_end');

            });

        }).then(instances => {
            return knex.schema.alterTable("service_instance_properties", t => {
                t.boolean("required").default(false);
                t.boolean("prompt_user").default(true);;
            });

        }).then(instance => {
            return knex.schema.raw(`
    ALTER TABLE "service_instances"
    DROP CONSTRAINT "service_instances_type_check",
    ADD CONSTRAINT "service_instances_type_check" 
    CHECK (type IN ('subscription', 'one_time', 'custom', 'split'))`);

        }).then(instance => {
            return knex.schema.raw(`
    ALTER TABLE "service_templates"
    DROP CONSTRAINT "service_templates_type_check",
    ADD CONSTRAINT "service_templates_type_check" 
    CHECK (type IN ('subscription', 'one_time', 'custom', 'split'))`);
        })
    },

    down: function (knex) {
        console.log("rolling back version 0.9 migration");
        return knex.schema.alterTable("service_instances", t => {
            t.dropColumns("split_configuration");
        }).then(instances => {
            return knex.schema.alterTable("service_templates", t => {
                t.dropColumns("split_configuration", "trial_end");
            });
        }).then(instances => {
            return knex.schema.alterTable("service_instance_properties", t => {
                t.dropColumns("required", "prompt_user");
            });
        }).then(result => {
            return knex("service_templates").where("type", "split").update({type: "custom"});
        }).then(instances => {
            return knex("service_instances").where("type", "split").update({type: "custom"});
        }).then(instance => {

            //revert enums
            return knex.schema.raw(`
    ALTER TABLE "service_instances"
    DROP CONSTRAINT "service_instances_type_check",
    ADD CONSTRAINT "service_instances_type_check"
    CHECK (type IN ('subscription', 'one_time', 'custom'))`);

        }).then(instance => {
            return knex.schema.raw(`
    ALTER TABLE "service_templates"
    DROP CONSTRAINT "service_templates_type_check",
    ADD CONSTRAINT "service_templates_type_check"
    CHECK (type IN ('subscription', 'one_time', 'custom'))`);
        });

    }
}