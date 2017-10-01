let {call, take, takeEvery, cancel, actionChannel} = require("redux-saga/effects");
let express = require("express");
let consume = require("pluginbot/effects/consume");
let app = require("./app");
let { END }  = require("redux-saga");
module.exports = {
    run : function*(config, provide, services){
        try {
            console.log("startin!");
            yield consume(services.startTrigger);
            console.log("Setup starting!");
            let cancelChannel = yield actionChannel("FINISHED_SETUP");

            //wait for api to send initial configuration
            let expressApp = yield consume(services.expressApp);
            console.log("got my app!");
            let {initialConfig, response, emitter} = yield call(app, config.appConfig, expressApp);
            console.log("providing teh confs");

            let dbConfig = {
                host: initialConfig.db_host,
                user: initialConfig.db_user,
                database: initialConfig.db_name,
                password: initialConfig.db_password,
                port: initialConfig.db_port
            };


            yield provide({dbConfig});
            yield provide({initialConfig});
            yield take(cancelChannel);
            response.json({message: "Setup complete"});
            }
        finally {
            console.log("CLOSIN DOWN THE SETUP!");
        }

    }
};