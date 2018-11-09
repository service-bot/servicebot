module.exports = {


    up: async function (knex) {
    
        await knex.schema.alterTable("users", table => {
                table.string('google_refresh_token');
        });


        return await knex;
    },

    down: async function (knex) {
        await knex.schema.alterTable("users", table => {
            table.dropColumns("google_refresh_token");
        });

        return await knex;

    }
}