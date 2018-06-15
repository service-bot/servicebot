let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let sagaMiddleware = require("../../middleware/express-saga-middleware");

function* run(config, provide, channels) {
    let configurationManager = yield consume(channels.configurationManager);
    let middleware =  function*(req, res, next){
        let publicConfigurations = yield call(configurationManager.getConfigurations, true);
    };
    middleware = yield call(sagaMiddleware, middleware);

    let routeDefinition = {
            endpoint : "/initial-state",
            method : "get",
            middleware : [middleware],
            permissions : [],
            description : "Get initial state"

        }
    yield provide(routeDefinition);

}

module.exports = {run};