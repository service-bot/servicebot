module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.9");
        return knex.schema.alterTable("service_templates", t => {
            t.jsonb('split_configuration');
        }).then(subscriptions => {
            return knex.schema.alterTable("service_instances", t => {
                t.jsonb('split_configuration');
            });
        })
    },
    down : function(knex){
        console.log("rolling back version 0.9 migration");
        return knex.schema.alterTable("service_templates", t => {
            t.dropColumns("split_configuration");
        }).then(instances => {
            return knex.schema.alterTable("service_instances", t => {
                t.dropColumns("split_configuration");
            });
        });

    }
}