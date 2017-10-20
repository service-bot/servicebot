import  {call, put, all, select, fork, spawn, take, takeEvery} from "redux-saga/effects";
import consume from "pluginbot/effects/consume"
import ReactGA  from 'react-ga';


let actionHandler = function(action){
    switch(action.type){
        case "@@router/LOCATION_CHANGE" :
            return {
                category : "Navigation",
                action : "@@router/LOCATION_CHANGE",
                label : 'navigated to ' + action.payload.pathname
            };
        case "@@redux-form/SET_SUBMIT_SUCCEEDED":
            return {
                category : "Redux Form",
                action : "@@redux-form/SET_SUBMIT_SUCCEEDED",
                label : "successfully submitted " + action.meta.form
            };
        default:
            return false
    }
}

function* run(config, provide, channels) {
    //todo pull initialize from channel?
    let  { initialState } = yield take("INITIALIZE");
    if(initialState.options.google_analytics && initialState.options.google_analytics.value ){
        console.log("intial!!!!!", initialState.options.google_analytics.value);
        ReactGA.initialize(initialState.options.google_analytics.value, {
            'cookieDomain': 'none',
            gaOptions: {
                userId: initialState.uid
            }

        });
        yield takeEvery(actionHandler, function*(action){
            ReactGA.event(actionHandler(action));
        });
    }
}
export {run};