module.exports = function setup(options, imports, register) {
    let api = imports.api;
    let knex = imports.knex;
    let stripe = imports.stripe;

    knex.schema.hasTable('stripe_event_logs').hasTable('stripe').then(function(exists){
        if(exists.every(e => !e)){
            return knex.schema.createTable('stripe_event_logs', function(table){
                table.inherits('event_logs');
                table.string('event_id');
                console.log("Created 'stripe_event_logs' table.");
            });
        }else{
            return false;
        }
    }).then(function(result){
        require("./api/webhook")(api, knex, stripe);
        require("./api/reconfigure")(api, knex, stripe);
        require("./api/import")(api, knex, stripe);
        console.log(result);
    });

    register(null, {
        //define services this plugin provides...
    });
};
