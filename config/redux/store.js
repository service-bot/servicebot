
let NotificationTemplate = require("../../models/notification-template");
let thunk = require('redux-thunk').default;
let sagaMiddleware = require("./saga");
let { call, put, takeEvery } = require('redux-saga/effects')
let { delay } = require('redux-saga')


let { createStore, applyMiddleware, combineReducers } = require('redux');
let { EVENT, SET_EVENT_REDUCER,SET_EVENT_SAGAS, INIT_STORE, setEventReducer,setEventSagas, initializeStore, triggerEvent}  =  require("./actions");
const defaultAppState = {
    "eventReducer" : null,
    "eventSagas" : {}
};

//todo: handle events using sagas instead of reducer
function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    console.log(`action ${action.type}`);
    switch(action.type){
        case EVENT :
            console.log("EVENT!");
            if(state.eventReducer) {
                //sending empty state here --- we don't really care about this...
                //we don't want events to mutate state in the reducer - they should dispatch events
                state.eventReducer({}, action);
                return state
            }else{
                console.log("no event reducer");
                return state;
            }
        case SET_EVENT_REDUCER :
            console.log("SET EVENT REDUCER!")
            return Object.assign({}, state, {
                "eventReducer" : action.event_reducer
            });
        case SET_EVENT_SAGAS :
            console.log("SET EVENT SAGAS!")
            return Object.assign({}, state, {
                "eventSagas" : action.event_sagas
            });
        default:
            return state;
    }
}


//creates a new set of reducers based on the notification templates
function buildEventReducer(store){
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



let store = createStore(appReducer,applyMiddleware(thunk), applyMiddleware(sagaMiddleware));


store.subscribe(()=>{
    console.log("store changed", store.getState());
});



store.buildEventReducer = buildEventReducer;

function* handleEvent(action) {
        console.log(1)
        yield call(delay, 1000)
        console.log(2);
        console.log(action);

}

/*
 Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
 Allows concurrent fetches of user.
 */
function* mySaga() {
    yield takeEvery("EVENT", handleEvent);
}

/*
 Alternatively you may use takeLatest.

 Does not allow concurrent fetches of user. If "USER_FETCH_REQUESTED" gets
 dispatched while a fetch is already pending, that pending fetch is cancelled
 and only the latest one will be run.
 */


sagaMiddleware.run(mySaga);


module.exports = store;