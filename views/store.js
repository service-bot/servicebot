import React from "react"
import {createStore, applyMiddleware, combineReducers} from 'redux'
import {
    SET_FORM_DATA,
    SET_OPTIONS,
    SET_OPTION,
    SET_VERSION,
    SET_UID,
    SET_USER,
    SET_NOTIFICATIONS,
    DISMISS_ALERT,
    ADD_ALERT,
    SET_NOTIFICATION,
    ADD_SYSTEM_NOTIFICATION,
    SET_SYSTEM_NOTIFICATIONS,
    SET_SYSTEM_NOTIFICATION,
    ADD_NOTIFICATION,
    INITIALIZE,
    SET_PERMISSIONS,
    RESET_NAV_CLASS,
    SET_NAV_CLASS,
    SHOW_MODAL,
    HIDE_MODAL,
    initializeState
} from "./components/utilities/actions"
import cookie from 'react-cookie';
import thunk from "redux-thunk";
import {isAuthorized} from "./components/utilities/authorizer.jsx";
import Fetcher from "./components/utilities/fetcher.jsx";
import {reducer as formReducer} from 'redux-form'
import PluginbotClient from "pluginbot-react";
import {syncHistoryWithStore, routerReducer} from 'react-router-redux'
import {browserHistory} from 'react-router';
import Modal from "./components/utilities/modal.jsx"
let DELETETHISCODELATERUID = cookie.load("uid");

function oldFormReducer(state = {}, action) {
    switch (action.type) {
        case SET_FORM_DATA:
            let newFormData = action.formData;
            if (typeof newFormData === "function") {
                newFormData = newFormData(state[action.name]);
            }
            return {
                ...state,
                [action.name]: newFormData
            };
        default:
            return state;
    }
}

function optionsReducer(state = cookie.load("spk") ? {stripe_publishable_key : {option : "stripe_publishable_key", "data_type" : "hidden", value : cookie.load("spk")}} : {}, action) {
    switch (action.type) {
        case INITIALIZE :
            return {...state, ...action.initialState.options}
        case SET_OPTIONS :
            return {...state, ...action.options}
        case SET_OPTION :
            return {...state, [action.option.option] : action.option}

        case SET_VERSION :
            return {
                ...state,
                version: action.version
            };
        default:
            return state;
    }
}

function notificationsReducer(state = [], action) {
    switch (action.type) {
        case INITIALIZE :
            return action.initialState.notifications
        case ADD_NOTIFICATION :
            return [...state, action.notification];
        case SET_NOTIFICATIONS :
            return action.notifications;
        case SET_NOTIFICATION :
            return (state.map(notification => {
                if (notification.id == action.notification.id) {
                    return action.notification
                } else {
                    return notification;
                }
            }));
        default:
            return state;
    }
}

function permissionReducer(state = (localStorage.getItem("permissions") && localStorage.getItem("permissions").split(",")) || [], action) {
    switch (action.type) {
        case SET_PERMISSIONS :
            return action.permissions;
        default:
            return state;
    }
}

function systemNotificationReducer(state = [], action) {
    switch (action.type) {
        case INITIALIZE :
            return action.initialState.system_notifications
        case ADD_SYSTEM_NOTIFICATION :
            return [...state, action.notification];
        case SET_SYSTEM_NOTIFICATIONS :
            return action.notifications;
        case SET_SYSTEM_NOTIFICATION :
            return (state.map(notification => {
                if (notification.id == action.notification.id) {
                    return action.notification
                } else {
                    return notification;
                }
            }));
        default:
            return state;
    }
}

function alertsReducer(state = [], action) {
    switch (action.type) {
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

function interfaceReducer(state = {nav_class: "default"}, action) {
    switch (action.type) {
        case RESET_NAV_CLASS:
            return {...state, ...action.navbar};
        case SET_NAV_CLASS :
            return {...state, ...action.navbar};
        default:
            return state;
    }
}

function uidReducer(state = cookie.load("uid") || null, action) {
    switch (action.type) {
        case INITIALIZE :
            if (action.initialState.uid == undefined) {
                return null;
            } else {
                DELETETHISCODELATERUID = action.initialState.uid;
                return action.initialState.uid;
            }
        case SET_UID :
            DELETETHISCODELATERUID = action.uid;
            return action.uid;
        default:
            return state;
    }
}


function userReducer(state = {}, action) {
    switch (action.type) {
        case INITIALIZE :
            if (action.initialState.user == undefined) {
                return {};
            } else {
                return action.initialState.user;
            }
        case SET_USER :
            if (action.user == undefined) {
                return {};
            } else {
                return action.user;
            }
        default:
            return state;
    }
}

function modalReducer(state =(<div></div>), action) {
    switch (action.type) {
        case SHOW_MODAL :
            return (<Modal {...action.modalProps}/>);
        case HIDE_MODAL :
            return (<div></div>);
        default:
            return state;
    }
}


function historyReducer(state = browserHistory, action) {
    switch (action.type) {
        default:
            return state;
    }
}

const rootReducer = {
    allForms: oldFormReducer,
    options: optionsReducer,
    navbar: interfaceReducer,
    notifications: notificationsReducer,
    system_notifications: systemNotificationReducer,
    alerts: alertsReducer,
    uid: uidReducer,
    permissions : permissionReducer,
    user: userReducer,
    history: historyReducer,
    modal: modalReducer,
    form: formReducer,
    routing: routerReducer
};


// store.subscribe(()=>{
//     console.log("store changed", store.getState());
// });


let initializedState = function (initialOptions = null) {
    return async function (dispatch) {
        console.log(cookie.load("uid"));
        let initialState = {
            allForms: {},
            options: {},
            notifications: [],
            system_notifications: [],
            alerts: [],
            uid: cookie.load("uid"),
        };
        initialState.options = initialOptions || await Fetcher("/api/v1/system-options/public");
        try {
            if (cookie.load("uid")) { // if user is logged in
                initialState.user = (await Fetcher("/api/v1/users/own"))[0];
                //Set the version of the application if the user is logged in
                let version = await Fetcher("/api/v1/system-options/version");
                initialState.options = {...initialState.options, version: version.version};
                if (initialState.user.status === 'invited') {
                    initialState.alerts = [...initialState.alerts, {
                        id: '1',
                        message: 'Please check your email and set your password to complete your account.',
                        show: true
                    }];
                    // initialState.alerts = [...initialState.alerts, {id: '2', message: 'A dummy alert.', show: true}];
                } else {
                }
                initialState.notifications = await Fetcher("/api/v1/notifications/own");
                if (isAuthorized({permissions: "put_email_templates_id"})) {
                    initialState.system_notifications = await Fetcher("/api/v1/notifications/system");
                }
            }
        }
        catch (err) {
            console.error("Error initializing state: ", err)
            initialState.options.backgroundColor = "#000000";
        }
        return dispatch(initializeState(initialState));
    }
};


let initialize = async function () {

    let app = await PluginbotClient.createPluginbot();
    let middleware = [rootReducer, thunk];
    // if(process.env.NODE_ENV === "development"){
    const { logger } = require(`redux-logger`);
    middleware.push(logger);
    // }
    await app.initialize(...middleware);
    return app;

};

let pluginbot = initialize();
export {pluginbot, initializedState, DELETETHISCODELATERUID};