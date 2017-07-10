import { createStore } from 'redux'
import {SET_FORM_DATA, SET_OPTIONS, SET_UID, SET_USER, SET_NOTIFICATIONS} from "./components/utilities/actions"
import cookie from 'react-cookie';

const defaultAppState = {
    allForms : {},
    options: {},
    uid : cookie.load("uid")
};

function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    switch(action.type){
        case SET_NOTIFICATIONS :
            return {
                ...state,
                notifications : action.notifications
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

let store = createStore(appReducer);

store.subscribe(()=>{
    console.log("store changed", store.getState());
});

export { store };