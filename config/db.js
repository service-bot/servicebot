var config = {
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    database: process.env.POSTGRES_DB_NAME,
    password: process.env.POSTGRES_DB_PASSWORD,
    port: process.env.POSTGRES_DB_PORT
};

//this is for parsing bigints
var pg = require('pg')
pg.types.setTypeParser(20, 'text', parseInt)

var knex = require('knex')({
    client: 'pg',
    connection: config,
    pool: { min: 0, max: 10 }
});



module.exports = knex;
