module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.7.3");
        return knex.schema.alterTable("user_invoices", t => {
                t.dropForeign("service_instance_id");
                t.integer('service_instance_id').references('service_instances.id').onDelete('cascade').alter();

            })
    },
    down : function(knex){
        console.log("rolling back version 0.7.3 migration");
        return knex.schema.alterTable("user_invoices", t => {
            t.dropForeign("service_instance_id");
            t.integer('service_instance_id').references('service_instances.id').alter();
        })
    }
}