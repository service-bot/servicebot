/*
 * action types
 */

export const SET_OPTIONS = 'SET_OPTIONS'
export const SET_UID = 'SET_UID'

/*
 * other constants
 */



/*
 * action creators
 */

export function setOptions(options){
    return {
        type: SET_OPTIONS,
        options
    }
}

export function setUid(uid) {
    return { type: SET_UID, uid }
}

