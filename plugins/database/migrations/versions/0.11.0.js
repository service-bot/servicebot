module.exports = {


    up: async function (knex) {
        await knex.schema.createTable("service_instance_seats", table => {
            table.increments();
            table.integer('user_id').references('users.id').notNullable().onDelete('cascade');
            table.integer('service_instance_id').notNullable().references("service_instances.id").onDelete("cascade");
            table.unique(["user_id", "service_instance_id"]);
            table.string("type").notNullable().defaultTo("seat");
            table.timestamps(true, true);
        });
        await knex.schema.alterTable("users", table => {
                table.string('google_user_id').unique();
        });


        return await knex;
    },

    down: async function (knex) {
        await knex.schema.alterTable("users", table => {
            table.dropColumns("google_user_id");
        });
        await knex.schema.dropTable("service_instance_seats");

        return await knex;

    }
}