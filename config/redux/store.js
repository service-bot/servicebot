
let NotificationTemplate = require("../../models/notification-template");
let thunk = require('redux-thunk').default;
let sagaMiddleware = require("./saga");
let { call, put, takeEvery } = require('redux-saga/effects')
let { delay } = require('redux-saga')
let Settings =  require('../../models/system-options');

let { createStore, applyMiddleware, combineReducers } = require('redux');
let { EVENT, SET_EVENT_REDUCER,SET_EVENT_SAGAS, INIT_STORE, setEventReducer,setEventSagas, initializeStore, triggerEvent}  =  require("./actions");
const defaultAppState = {
    "eventReducer" : null,
    "eventSagas" : {}
};

//todo: store sagas in store
function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    console.log(`action ${action.type}`);
    switch(action.type){
        case INIT_STORE:
            return action.initialStore;
        case SET_EVENT_SAGAS :
            console.log("SET EVENT SAGAS!")
            return Object.assign({}, state, {
                "eventSagas" : action.event_sagas
            });
        default:
            return state;
    }
}





let store = createStore(appReducer,applyMiddleware(thunk), applyMiddleware(sagaMiddleware));

store.subscribe(()=>{
});


function dispatchEvent(eventName, eventObject){
   return store.dispatch(triggerEvent(eventName, eventObject));
}


store.initialize = function(){
    let initialState = {};
    return new Promise((resolve, reject) => {
        Settings.findAll(true, true, (result) => {
            resolve(result.reduce((settings, setting)=>{
                settings[setting.data.option] = setting.data.value;
                return settings;
            }, {}))
        })
    }).then((result) => {
        initialState["options"] = result;
        return sagaMiddleware.initialize()
    }).then(store.dispatch(initializeStore(initialState))
     ).catch((err) => {
        console.error(err)
        reject(err);
    })
};
store.sagaMiddleware = sagaMiddleware;
store.dispatchEvent = dispatchEvent;
module.exports = store;