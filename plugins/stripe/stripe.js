let consume = require("pluginbot/effects/consume");
let {call} = require("redux-saga/effects");
let run = function*(config, provide, services){
    console.log("WHERES MA DATABSE");
  let database = yield consume(services.database);
  console.log("HI FRIEND!");
  //todo: move this to some installation script
    let createDB = function(database){
      return database.schema.hasTable('stripe_event_logs').hasTable('stripe').then(function(exists){
            if(exists.every(e => !e)){
                return database.schema.createTable('stripe_event_logs', function(table){
                    table.inherits('event_logs');
                    table.string('event_id');
                    console.log("Created 'stripe_event_logs' table.");
                });
            }else{
                return false;
            }
        })
    };

    let routeDefinition = [
        require("./api/webhook")(database),
        ...require("./api/reconfigure")(database),
        require("./api/import")(database),
        {
            "endpoint" : "/hello/world",
            "method" : "get",
            "permissions" : [],
            "description" : "ello",
            "middleware" : [function(req,res){
                console.log("HELLO WORLD!");
                res.json({hello : "world"});
            }]
        }
    ];



    yield call(createDB, database);
    yield provide({routeDefinition});
};

module.exports = {run};