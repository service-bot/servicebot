module.exports = {


    up: async function (knex) {
    
        await knex.schema.alterTable("users", table => {
                table.string('google_reset_token');
        });


        return await knex;
    },

    down: async function (knex) {
        await knex.schema.alterTable("users", table => {
            table.dropColumns("google_reset_token");
        });

        return await knex;

    }
}