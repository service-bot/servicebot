let {put, call} = require("redux-saga/effects");
let {  setOptions }  =  require("../../config/redux/actions");
let consume = require("pluginbot/effects/consume");
module.exports = {
    run: function* (config, provide, services) {
        let db = yield consume(services.database);
        let Settings = require('../../models/system-options');
        let initialOptions = yield call(Settings.getOptions);
        yield put(setOptions(initialOptions));

    }

}