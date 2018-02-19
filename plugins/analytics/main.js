let consume = require("pluginbot/effects/consume");
let {call} = require("redux-saga/effects");

let run = function*(config, provide, services) {
    let db = yield consume(services.database);
    let analytics = require("./analytics")
    let routeDefinition = require("./api")(analytics)
    yield provide({routeDefinition, analytics})
};
module.exports = {run};