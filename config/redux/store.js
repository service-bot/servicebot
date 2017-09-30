//todo: consolidate with pluginbot
let NotificationTemplate = require("../../models/notification-template");
let thunk = require('redux-thunk').default;
let sagaMiddleware = require("./saga");
let { call, put, takeEvery } = require('redux-saga/effects')
let { delay } = require('redux-saga')
let Settings =  require('../../models/system-options');

let { createStore, applyMiddleware, combineReducers } = require('redux');


let { EVENT, SET_OPTIONS,SET_EVENT_SAGAS, INIT_STORE, setOptions ,setEventSagas, initializeStore, triggerEvent}  =  require("./actions");
const defaultAppState = {
    "eventReducer" : null,
    "eventSagas" : {},
    "options" : {}
};
//todo: store sagas in store?
function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    switch(action.type) {
        case EVENT:
            return state;
        case INIT_STORE:
            return action.initialStore;
        case SET_EVENT_SAGAS :
            return Object.assign({}, state, {
                "eventSagas" : action.event_sagas
            });
        case SET_OPTIONS :
            let options = Object.assign({}, state.options, action.options);
            return Object.assign({}, state, {
                "options" : options
            })
        default:
            return state;
    }
}








class Store{
    constructor(){
        this.reducer = appReducer;
    }
    setStore(store){
      this.store = store;
    }
    getState(){
        return this.store.getState().servicebot;
    }
    dispatchEvent(eventName, eventObject){
        return this.store.dispatch(triggerEvent(eventName, eventObject));

    };
}

module.exports = new Store();