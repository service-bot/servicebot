let {call, take, takeEvery, cancel, actionChannel} = require("redux-saga/effects");
let express = require("express");
let consume = require("pluginbot/effects/consume");
let app = require("./app");
module.exports = {
    run : function*(config, provide, services){
        try {
            console.log("startin!");
            yield consume(services.startTrigger);
            console.log("Setup starting!");
            let cancelChannel = yield actionChannel("FINISHED_SETUP");
            //start stuff
            let initialConfig = yield call(app, config.appConfig);
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
            cancel();
        }
        finally {
            console.log("CLOSIN DOWN THE SETUP!");
        }

    }
};