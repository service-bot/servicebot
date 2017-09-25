let {call, put, cancel} = require("redux-saga/effects")

module.exports = {
    run : function*(config, provide, services){
        if(!config.environment){
            yield put({type : "START_SETUP_SERVER"});
            console.log("NO ENVIRONMENT CONFIGURED");
            yield cancel()
        }
        yield provide({environment : config.environment});
    }
}