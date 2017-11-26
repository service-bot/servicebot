let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let sagaMiddleware = require("../../middleware/express-saga-middleware");

function* run(config, provide, channels) {
    let configurationManager = yield consume(channels.configurationManager);
    let css = yield call(configurationManager.getConfiguration, "extra_css");

    function* getCssMiddleware(req, res, next){
        let css = yield call(configurationManager.getConfiguration, "extra_css");
        res.set('Content-Type', 'text/css');
        yield call([res, "send"], css.value);
    }

    //todo: maybe api gateway can make saga middleware?
    let middleware = yield call(sagaMiddleware, getCssMiddleware);
    yield provide({routeDefinition : [{
        endpoint : "/extra-css.css",
        method : "get",
        middleware : [middleware],
        permissions : [],
        description : "Get any extra CSS"

    }]})
};
module.exports = {run};