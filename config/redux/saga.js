/**
 * Created by ben on 7/6/17.
 */
let saga = require("redux-saga").default;
let { call, put, takeEvery, all } = require('redux-saga/effects')
let sagaMiddleware = saga();
let NotificationTemplate = require("../../models/notification-template");

let unsubscribe = {};
function getNotificationSagas(){
    return new Promise(function(resolve, reject) {
        NotificationTemplate.findAll(true, true, function (templates) {
            resolve(templates.map( (template) => {
                return call(function*(){
                    yield takeEvery((action) => {
                        return action.event_name == template.data.event_name
                    }, template.createNotification.bind(template))});
                })
            )
        })
    });
}
function initialize(){
    return getNotificationSagas().then(result => {
        unsubscribe = sagaMiddleware.run(function*(){
            yield all(result);
        });
        unsubscribe.cancel();
        console.log(unsubscribe.isCancelled());
        let task2 = sagaMiddleware.run(function*(){
            yield all(result);
        })
        console.log(task2.isRunning())
    })
}

sagaMiddleware.initialize = initialize;
sagaMiddleware.getNotificationSagas = getNotificationSagas;
module.exports = sagaMiddleware;