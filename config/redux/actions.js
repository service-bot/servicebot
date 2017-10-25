
/*
 * action types
 */
let actions = {};

actions.SET_EVENT_REDUCER = 'SET_EVENT_REDUCER';
actions.SET_EVENT_SAGAS = 'SET_EVENT_SAGAS';
actions.SET_OPTIONS = "SET_OPTIONS";
actions.EVENT = 'EVENT';
actions.INIT_STORE = "INIT_STORE";

/*
 * action creators
 */

actions.setEventReducer = function(event_reducer){
    return { type: actions.SET_EVENT_REDUCER, event_reducer }
}
actions.setEventSagas = function(event_sagas){
    return { type: actions.SET_EVENT_SAGAS, event_sagas }
}

actions.setOptions = function(options){
    console.log("SET OPTION!");
    return { type: actions.SET_OPTIONS, options }
}

actions.initializeStore = function(initialStore) {
    return { type: actions.INIT_STORE, initialStore }
}

actions.triggerEvent = function(event_name, event_object) {
    return { type: actions.EVENT, event_name, event_object}
}

module.exports = actions;