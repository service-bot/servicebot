import Fetcher from '../utilities/fetcher.jsx';

/*
 * action types
 */

export const SET_OPTIONS = 'SET_OPTIONS';
export const SET_OPTION = 'SET_OPTION';
export const SET_VERSION = 'SET_VERSION';
export const SET_UID = 'SET_UID';
export const SET_PERMISSIONS = "SET_PERMISSIONS";
export const SET_USER = "SET_USER";
export const ADD_NOTIFICATION = "ADD_NOTIFICATION";
export const SET_NOTIFICATIONS = "SET_NOTIFICATIONS";
export const SET_NOTIFICATION = "SET_NOTIFICATION";
export const ADD_SYSTEM_NOTIFICATION = "ADD_SYSTEM_NOTIFICATION";
export const SET_SYSTEM_NOTIFICATIONS = "SET_SYSTEM_NOTIFICATIONS";
export const SET_SYSTEM_NOTIFICATION = "SET_SYSTEM_NOTIFICATION";
export const SET_FORM_DATA = "SET_FORM_DATA";
export const INITIALIZE = "INITIALIZE";
export const DISMISS_ALERT = "DISMISS_ALERT";
export const ADD_ALERT = "ADD_ALERT";
export const RESET_NAV_CLASS = "RESET_NAV_CLASS";
export const SET_NAV_CLASS = "SET_NAV_CLASS";
export const SETUP_COMPLETE = "SETUP_COMPLETE";
export const SHOW_MODAL = "SHOW_MODAL";
export const HIDE_MODAL = "HIDE_MODAL";
/*
 * other constants
 */
export function fetchUsers(uid = null, callback){
    let user = null;
    if(uid){
        // console.log("redux action setUser", uid);
        Fetcher("/api/v1/users/own", "GET").then(function (response) {
            // console.log("user response", response);
            if(!response.error && response.length){
                user = response[0];
                callback(null, user);
            }else{
                callback(response.error)
                // console.log("error fetching own user after login");
            }
        });
    }
    callback("no uid");
}


/*
 * action creators
 */

export function setOptions(options){
    return { type: SET_OPTIONS, options }
}
export function setOption(option){
    return { type: SET_OPTION, option }
}

export function setVersion(version){
    return { type: SET_VERSION, version }
}

export function initializeState(initialState){
    return { type: INITIALIZE, initialState }
}

export function addNotification(notification, isSystem){
    return { type: ADD_NOTIFICATION, notification, isSystem }
}

export function setNotifications(notifications, isSystem){
    return { type: SET_NOTIFICATIONS, notifications, isSystem }
}

export function setNotification(notification, isSystem){
    return { type: SET_NOTIFICATION, notification, isSystem }
}

export function addSystemNotification(notification, isSystem){
    return { type: ADD_NOTIFICATION, notification, isSystem }
}

export function setSystemNotifications(notifications, isSystem){
    return { type: SET_SYSTEM_NOTIFICATIONS, notifications, isSystem }
}
export function setSystemNotification(notification, isSystem){
    return { type: SET_NOTIFICATION, notification, isSystem }
}

export function setupComplete(isComplete){
    return { type: SETUP_COMPLETE, isComplete }
}

export function setUid(uid) {
    return { type: SET_UID, uid }
}

export function setUser(user) {
    return { type: SET_USER, user }
}

export function setPermissions(permissions){
    return { type : SET_PERMISSIONS, permissions}
}

export function setFormData(name, formData){
    return { type: SET_FORM_DATA, name, formData  }
}

export function dismissAlert(alerts){
    return { type: DISMISS_ALERT, alerts }
}
export function addAlert(alert){
    return { type: ADD_ALERT, alert }
}

export function resetNavClass(){
    return {type: RESET_NAV_CLASS, navbar: {nav_class : "default"}}
}

export function setNavClass(className){
    return {type: SET_NAV_CLASS, navbar: {nav_class : className}}
}

export function showModal(component, hide, titleText, buttonText, icon, titleColor, hideButton){
    return {type: SHOW_MODAL, modalProps: {closeBtnText: buttonText, component, titleColor, modalTitle: titleText, hideCloseBtn: hideButton, hide, icon}}
}

export function hideModal(){
    return {type: HIDE_MODAL}
}