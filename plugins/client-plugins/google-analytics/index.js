import  {call, put, all, select, fork, spawn, take, takeEvery} from "redux-saga/effects";
import consume from "pluginbot/effects/consume"
import ReactGA  from 'react-ga';


let actionHandler = function(action, state){
    switch(action.type){
        case "@@redux-form/SET_SUBMIT_SUCCEEDED":
            return {
                category : "Forms",
                action : "Successfully submitted " + action.meta.form
            };
        case "@@redux-form/START_SUBMIT":
            return {
                category : "Forms",
                action : "Start Submit " + action.meta.form,
            };
        case  "@@redux-form/SET_SUBMIT_FAILED" :
            if(!state){
                return true;
            }
            let form = state.form[action.meta.form];
            let label = form.error || JSON.stringify(form.syncErrors)
            return {
                category : "Forms",
                action : "Submit Failed " + action.meta.form,
                label
            }
        default:
            return false
    }
}


function* run(config, provide, channels) {
    //todo pull initialize from channel?
    let  { initialState } = yield take("INITIALIZE");
    if(initialState.options.google_analytics && initialState.options.google_analytics.value ){
        ReactGA.initialize(initialState.options.google_analytics.value);
        if(initialState.uid){
            ReactGA.set({ userId: initialState.uid });
        }
        yield takeEvery(actionHandler, function*(action){
            let state = yield select();
            ReactGA.event(actionHandler(action, state));
        });
        yield takeEvery("@@router/LOCATION_CHANGE", function*(action){
            ReactGA.set({ page: action.payload.pathname});
            ReactGA.pageview(action.payload.pathname);
        })
    }
}
export {run};