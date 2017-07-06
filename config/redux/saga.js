/**
 * Created by ben on 7/6/17.
 */
let saga = require("redux-saga").default;

let sagaMiddleware = saga();
let NotificationTemplate = require("../../models/notification-template");

function buildSaga(){
    return new Promise(function(resolve, reject) {
        NotificationTemplate.findAll(true, true, function (templates) {
            let notificationTemplateReducers = templates.reduce((reducers, template) => {

                reducers[template.data.name] = function (state={}, action) {
                    switch (action.event_name) {
                        case template.data.event_name:
                            template.createNotification(action.event_object).then((result) => {
                                console.log(`template ${template.data.name} triggered for event ${action.event_name} - - - ${result}`)
                            }).catch(err => {console.log("err", err)});
                            return state;
                        default:
                            return state;
                    }
                }
                return reducers;
            }, {})
            //let pluginEventReducer = codeToGetPluginReducer();
            //combines the reducers created
            let eventReducer = combineReducers(notificationTemplateReducers)
            store.dispatch(setEventReducer(eventReducer));
            resolve("event reducer generated");
            //todo: add part which adds plugin reducers to event
        })
    });
}

module.exports = sagaMiddleware;