module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.4.0");
        return knex.schema.alterTable("notification_templates", t => {
                t.string('description');
            })
    },
    down : function(knex){
        console.log("rolling back version 0.4.0 migration");
        return knex.schema.alterTable("email_templates", t => {
                t.dropColumns("description");
             })
    }
}