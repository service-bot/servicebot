import {call, put, all, select, fork, spawn, take, takeEvery} from "redux-saga/effects";
import consume from "pluginbot/effects/consume"
import routeDefinition from "./view/form.jsx";




function* run(config, provide, channels) {
    yield provide({routeDefinition});
};
export {run};