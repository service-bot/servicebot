module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.8");
        return knex.schema.alterTable("users", t => {
            t.string("provider").defaultTo("local");

        })
    },
    down : function(knex){
        console.log("rolling back version 0.8 migration");
        return knex.schema.alterTable("users", t => {
            t.dropColumns("provider");
        })
    }
}