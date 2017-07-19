/**
 * Created by ben on 7/6/17.
 */
let saga = require("redux-saga").default;
let { call, put, takeEvery, all } = require('redux-saga/effects')
let sagaMiddleware = saga();
let setOptions = require("./actions").setOptions;
let unsubscribe = {};
function getNotificationSagas(){
    let NotificationTemplate = require("../../models/notification-template");
    return new Promise(function(resolve, reject) {
        NotificationTemplate.findAll(true, true, function (templates) {
            resolve(templates.map( (template) => {
                let callCreateNotification = function(action){
                    return template.createNotification(action.event_object);
                };

                return call(function*(){
                    yield takeEvery(sagaEventPattern(template.get('event_name')), callCreateNotification)});
                })
            )
        })
    });
}
let setOptionSaga = function*(action){
    yield put(setOptions(action.event_object));
}
let sagaEventPattern = function(event_name){
    return function(action){
        return action.type == "EVENT" && action.event_name == event_name
    }
}
function initialize(){
    return getNotificationSagas().then(result => {
        let notificationSaga = sagaMiddleware.run(function*(){
            yield all(result);
        });
        let optionSaga = sagaMiddleware.run(function*(){
            yield takeEvery(sagaEventPattern("system_options_updated"), setOptionSaga)
        })

    })
}

sagaMiddleware.initialize = initialize;
sagaMiddleware.getNotificationSagas = getNotificationSagas;
module.exports = sagaMiddleware;