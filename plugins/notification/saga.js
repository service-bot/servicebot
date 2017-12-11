let consume = require("pluginbot/effects/consume");
let {call, put, takeEvery, all, fork} = require('redux-saga/effects')
let setOptions = require("../../config/redux/actions").setOptions;

function getNotificationSagas() {
    //todo move table to be managed by THIS plugin
    let NotificationTemplate = require("../../models/notification-template");
    return new Promise(function (resolve, reject) {
        NotificationTemplate.findAll(true, true, function (templates) {
            resolve(templates.map((template) => {
                    let callCreateNotification = function (action) {
                        return template.createNotification(action.event_object);
                    };

                    return call(function* () {
                        yield takeEvery(sagaEventPattern(template.get('event_name')), callCreateNotification)
                    });
                })
            )
        })
    });
}

let setOptionSaga = function* (action) {
    yield put(setOptions(action.event_object));
}
let sagaEventPattern = function (event_name) {
    return function (action) {
        return action.type === "EVENT" && action.event_name === event_name
    }
}


module.exports = {
    run: function* (config, provide, services) {
        let database = yield consume(services.database);
        let notificationSagas = yield call(getNotificationSagas);
        let notificationTask = yield fork(all, notificationSagas);
        let optionTask = yield takeEvery(sagaEventPattern("system_options_updated"), setOptionSaga);
    }
};