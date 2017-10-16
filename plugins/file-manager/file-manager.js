let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

function* run(config, provide, channels) {
        let db = yield consume(channels.database);

};
module.exports = {run};