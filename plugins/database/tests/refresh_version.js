let path = require("path");
require('dotenv').config({path: require("path").join(__dirname, '../../../env/.env')});

let knex = require("../../../config/db");

// require("../migrations/versions/0.9.0").down(knex);
try {
    require("../migrations/versions/0.10.0").down(knex).catch(error => console.log(error));
}catch(e){
    console.error(e);
}