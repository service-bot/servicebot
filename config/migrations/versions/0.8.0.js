module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.8");
        return knex.schema.alterTable("users", t => {
            t.string("provider").defaultTo("local");
        }).then(subscriptions => {
            return knex.schema.alterTable("service_instances", t => {
                t.bigInteger('subscribed_at');
            });
        }).then(result => {
            return knex("service_instances").where(true, true);
        }).then(instances => {
            let instanceUpdates = instances.map(service => {
                let payment_plan = service.payment_plan;
                if(payment_plan) {
                    service.subscribed_at = payment_plan.created;
                }
                return knex("service_instances").where("id", service.id).update(service);
            });
            return Promise.all(instanceUpdates);
        })

    },
    down : function(knex){
        console.log("rolling back version 0.8 migration");
        return knex.schema.alterTable("users", t => {
            t.dropColumns("provider");
        }).then(instances => {
            return knex.schema.alterTable("service_instances", t => {
                t.dropColumns("subscribed_at");
            });
        });

    }
}