let consume = require("pluginbot/effects/consume");
let {call} = require("redux-saga/effects");
let PluginOption = require("../../models/services/pluginOption");
let run = function* (config, provide, services) {
    let database = yield consume(services.database);
    //todo: move this to some installation script when it's more fleshed out


    let routeDefinition = [
        require("./api/webhook")(database),
        ...require("./api/reconfigure")(database),
        require("./api/import")(database),
    ];

    yield call(database.createTableIfNotExist, "stripe_event_logs", function (table) {
        table.inherits('event_logs');
        table.string('event_id');
        console.log("Created 'stripe_event_logs' table.");

    });


    yield provide({routeDefinition});
};

module.exports = {run};