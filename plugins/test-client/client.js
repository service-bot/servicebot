import { router } from 'redux-saga-router';
import { browserHistory as history } from 'react-router';
import { call, put, fork} from "redux-saga/effects";

function* run(config, provide, services){
    console.log("!!!!");
    const routes = {
        // ...
    };



        yield fork(router, history, routes);

}

export {run}