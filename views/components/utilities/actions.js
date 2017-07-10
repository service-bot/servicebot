import Fetcher from '../utilities/fetcher.jsx';

/*
 * action types
 */

export const SET_OPTIONS = 'SET_OPTIONS';
export const SET_UID = 'SET_UID';
export const SET_USER = "SET_USER";
export const SET_NOTIFICATIONS = "SET_NOTIFICATIONS";
export const SET_FORM_DATA = "SET_FORM_DATA";
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

export function setNotifications(notifications){
    return { type: SET_NOTIFICATIONS, notifications }
}


export function setUid(uid) {
    return { type: SET_UID, uid }
}

export function setUser(user) {
    return { type: SET_USER, user }
}

export function setFormData(name, formData){
    return { type: SET_FORM_DATA, name, formData  }
}

