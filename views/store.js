import { createStore, applyMiddleware } from 'redux'
import {SET_FORM_DATA, SET_OPTIONS, SET_UID, SET_USER, SET_NOTIFICATIONS, ADD_NOTIFICATION, INITIALIZE} from "./components/utilities/actions"
import cookie from 'react-cookie';
import thunk from "redux-thunk";
const defaultAppState = {
    allForms : {},
    options: {},
    notifications: [],
    system_notifications: [],
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
            }
        case SET_NOTIFICATIONS :
            let setLocation = "notifications"
            if(action.isSystem){
                setLocation = "system_notifications"
            }
            console.log(setLocation, action.isSystem, "OWOOOO")
            return {
                ...state,
                [setLocation] : action.notifications
            }
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
        default:
            return state;
    }
}

let store = createStore(appReducer, applyMiddleware(thunk) );

store.subscribe(()=>{
    console.log("store changed", store.getState());
});

export { store };