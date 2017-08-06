import { createStore, applyMiddleware, combineReducers } from 'redux'
import {SET_FORM_DATA, SET_OPTIONS, SET_VERSION, SET_UID, SET_USER, SET_NOTIFICATIONS, DISMISS_ALERT, ADD_ALERT, SET_NOTIFICATION,ADD_SYSTEM_NOTIFICATION, SET_SYSTEM_NOTIFICATIONS,SET_SYSTEM_NOTIFICATION, ADD_NOTIFICATION, INITIALIZE, initializeState} from "./components/utilities/actions"
import cookie from 'react-cookie';
import thunk from "redux-thunk";
import {isAuthorized} from "./components/utilities/authorizer.jsx";
import Fetcher from "./components/utilities/fetcher.jsx";
import { reducer as formReducer } from 'redux-form'
import logger from 'redux-logger'

function oldFormReducer(state = {}, action) {
    switch(action.type){
        case SET_FORM_DATA:
            let newFormData = action.formData;
            if(typeof newFormData === "function"){
                newFormData = newFormData(state[action.name]);
            }
            return {
                ...state,
                [action.name] : newFormData
            };
        default:
            return state;
    }
}

function optionsReducer(state = {}, action) {
    switch(action.type){
        case INITIALIZE :
            return action.initialState.options
        case SET_OPTIONS :
            return {...state, ...action.options }
        case SET_VERSION :
            return {
                ...state,
                version : action.version
            };
        default:
            return state;
    }
}

function notificationsReducer(state = [], action) {
    switch(action.type){
        case INITIALIZE :
            return action.initialState.notifications
        case ADD_NOTIFICATION :
            return [...state, action.notification];
        case SET_NOTIFICATIONS :
            return action.notifications;
        case SET_NOTIFICATION :
            return (state.map(notification => {
                if(notification.id == action.notification.id){
                    return action.notification
                }else{
                    return notification;
                }
            }));
        default:
            return state;
    }
}

function systemNotificationReducer(state = [], action) {
    switch(action.type){
        case INITIALIZE :
            return action.initialState.system_notifications
        case ADD_SYSTEM_NOTIFICATION :
            return [...state, action.notification];
        case SET_SYSTEM_NOTIFICATIONS :
            return action.notifications;
        case SET_SYSTEM_NOTIFICATION :
            return (state.map(notification => {
                if(notification.id == action.notification.id){
                    return action.notification
                }else{
                    return notification;
                }
            }));
        default:
            return state;
    }
}

function alertsReducer(state = [], action) {
    switch(action.type){
        case INITIALIZE :
            return action.initialState.alerts;
        case DISMISS_ALERT:
            return action.alerts;
        case ADD_ALERT:
            return [...state, action.alert];
        default:
            return state;
    }
}

function uidReducer(state = cookie.load("uid") || null, action) {
    switch(action.type){
        case INITIALIZE :
            if(action.initialState.uid == undefined) {
                return null;
            } else {
                return action.initialState.uid;
            }
        case SET_UID :
            return action.uid;
        default:
            return state;
    }
}

function userReducer(state = {}, action) {
    switch(action.type){
        case INITIALIZE :
            if(action.initialState.user == undefined) {
                return {};
            } else {
                return action.initialState.user;
            }
        case SET_USER :
            if(action.user == undefined) {
                return {};
            } else {
                return action.user;
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    allForms : oldFormReducer,
    options: optionsReducer,
    notifications: notificationsReducer,
    system_notifications: systemNotificationReducer,
    alerts: alertsReducer,
    uid : uidReducer,
    user: userReducer,
    form: formReducer
});

let store = createStore(rootReducer, applyMiddleware(thunk, logger));

// store.subscribe(()=>{
//     console.log("store changed", store.getState());
// });


let initializedState = async function(dispatch){
    let initialState = {
        allForms : {},
        options: {},
        notifications: [],
        system_notifications: [],
        alerts: [],
        uid : cookie.load("uid")
    };
    initialState.options = await Fetcher("/api/v1/system-options/public");
    try {
        console.log("before checking cookie for uid");
        if (cookie.load("uid")) { // if user is logged in
            initialState.user = (await Fetcher("/api/v1/users/own"))[0];
            //Set the version of the application if the user is logged in
            let version = await Fetcher("/api/v1/system-options/version");
            initialState.options = {...initialState.options, version:version.version};
            console.log("user loaded");
            if(initialState.user.status === 'invited'){
                console.log('user is invited, set redux store alert');
                initialState.alerts = [...initialState.alerts, {id: '1', message: 'Please check your email and set your password to complete your account.', show: true}];
                // initialState.alerts = [...initialState.alerts, {id: '2', message: 'A dummy alert.', show: true}];
            }else{
                console.log('user is not invited');
            }
            initialState.notifications = await Fetcher("/api/v1/notifications/own");
            if(isAuthorized({permissions: "put_email_templates_id"})){
                initialState.system_notifications = await Fetcher("/api/v1/notifications/system");
            }
        }
    }
    catch(err){
        initialState.options.backgroundColor = "#000000";
    }
    return dispatch(initializeState(initialState));
};



export { store, initializedState };