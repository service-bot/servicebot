let {call, take, takeEvery, cancel, actionChannel} = require("redux-saga/effects");
let express = require("express");
let consume = require("pluginbot/effects/consume");
let app = require("./app");
let { END }  = require("redux-saga");
module.exports = {
    run : function*(config, provide, services){
        try {
            let setup = yield consume(services.startSetup);
            let cancelChannel = yield actionChannel("FINISHED_SETUP");

            //wait for api to send initial configuration
            let expressApp = yield consume(services.expressApp);
            let {initialConfig, response} = yield call(app, config.appConfig, config.initialConfig || {}, setup.dbConfig, expressApp);

            //db config already exists so don't provide one.
            if(!setup.dbConfig) {
                let dbConfig = {
                    host: initialConfig.db_host,
                    user: initialConfig.db_user,
                    database: initialConfig.db_name,
                    password: initialConfig.db_password,
                    port: initialConfig.db_port
                };
                yield provide({dbConfig});
            }
            yield provide({initialConfig});
            let finish = yield take(cancelChannel);
            if(response){
                response.json({message: "Setup complete", options : finish.options});
            }
        }
        finally {
            console.log("CLOSIN DOWN THE SETUP!");
        }

    }
};