import { createStore, applyMiddleware } from 'redux'
import {SET_FORM_DATA, SET_OPTIONS, SET_UID, SET_USER, SET_NOTIFICATIONS, DISMISS_ALERT, ADD_ALERT, SET_NOTIFICATION, ADD_NOTIFICATION, INITIALIZE, initializeState} from "./components/utilities/actions"
import cookie from 'react-cookie';
import thunk from "redux-thunk";
import {isAuthorized} from "./components/utilities/authorizer.jsx";
import Fetcher from "./components/utilities/fetcher.jsx";

const defaultAppState = {
    allForms : {},
    options: {},
    notifications: [],
    system_notifications: [],
    alerts: [],
    uid : cookie.load("uid")
};

function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    //todo: make notifications cleaner
    switch(action.type){
        case INITIALIZE :
            console.log("INIT", state);
            return action.initialState
        case ADD_NOTIFICATION :
            let location = "notifications"
            if(action.isSystem){
                location = "system_notifications"
            }
            return {
                ...state,
                [location] : [...state[location], action.notification]
            };
        case SET_NOTIFICATIONS :
            let setLocation_notifications = "notifications"
            if(action.isSystem){
                setLocation_notifications = "system_notifications"
            }
            return {
                ...state,
                [setLocation] : action.notifications
            };
        case SET_NOTIFICATION :
            let setLocation = "notifications"
            if(action.isSystem){
                setLocation = "system_notifications"
            }
            let modifiedArray = state[setLocation].map(notification => {
                if(notification.id == action.notification.id){
                    return action.notification
                }else{
                    return notification;
                }
            });
            return {
                ...state,
                [setLocation] : modifiedArray
            };

        case SET_OPTIONS :
            return Object.assign({}, state, {
                options: action.options
            });
        case SET_UID :
            return Object.assign({}, state, {
                uid : action.uid
            });
        case SET_USER :
            return {
                ...state,
                user : action.user
            };
        case SET_FORM_DATA:
            let newFormData = action.formData;
            if(typeof newFormData === "function"){
                newFormData = newFormData(state.allForms[action.name]);
            }
            return {
                ...state,
                allForms : {
                    ...state.allForms,
                    [action.name] : newFormData
                }
            };
        case DISMISS_ALERT:
            return {
                ...state,
                alerts : action.alerts
            };
        case ADD_ALERT:
            return{
                ...state,
                alerts : [...state.alerts, action.alert]
            };
        default:
            return state;
    }
}

let store = createStore(appReducer, applyMiddleware(thunk) );

store.subscribe(()=>{
    console.log("store changed", store.getState());
});


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
            console.log("user loaded");
            if(initialState.user.status === 'invited'){
                console.log('user is invited, set redux store alert');
                initialState.alerts = [...initialState.alerts, {id: '1', message: 'Please check your email and set your password to complete your account.', show: true}];
                initialState.alerts = [...initialState.alerts, {id: '2', message: 'A dummy alert.', show: true}];
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