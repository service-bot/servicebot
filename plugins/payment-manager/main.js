let {call, put, all, select, fork, spawn, take, takeEvery} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let schedule = require('node-schedule');


function* startTimerWhenSubscribed(action) {
    let instance = action.event_object
    let plan = instance.get("payment_plan");
    let trial = plan.trial_period_days;
    if (trial) {
        let trialEnd = new Date(instance.get("subscribed_at") * 1000);
        trialEnd.setDate(trialEnd.getDate() + trial);

        let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));
        console.log("TRIAL STARTED!");
    }
}

function trialExpiration(instance) {
    return async function () {
        let Fund = require('../../models/fund');
        let fund = await Fund.findOne("user_id", instance.get("user_id"));
        if (!fund.data) {
            console.log("TRIAL EXPIRED AND NO FUNDS, UNSUBSCRIBE!");
            instance.unsubscribe()
        }else{
            console.log("funds have been added, no unsubscribe needed");
        }
    }
}

function* run(config, provide, channels) {
    let database = yield consume(channels.database);
    let ServiceInstance = require("../../models/service-instance");
    let Fund = require('../../models/fund');
    let instances = yield call(ServiceInstance.find, {"not": {"subscription_id": null}});
    for (let instance of instances) {
        console.log(instance.subscription_id);
        let plan = instance.get("payment_plan");
        let trial = plan.trial_period_days;
        if (trial) {
            let trialEnd = new Date(instance.get("subscribed_at") * 1000);
            console.log(trialEnd, "TRIAL DATE START");
            trialEnd.setDate(trialEnd.getDate() + trial);
            let fund = (yield call(Fund.find, {"user_id": instance.get("user_id")}))[0];
            if (!fund) {
                if (trialEnd <= (new Date())) {
                    console.log(trialEnd, new Date())
                    console.log("FOUND EXPIRED - UNSUBSCRIBING!");
                    instance.unsubscribe();
                } else {
                    console.log("no funds, setting expiration timer!");
                    let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));

                }
            }
        }

    }


    //todo: reduce duplicate code - this chunk is in a bunch of places :(
    let sagaEventPattern = function (event_name) {
        return function (action) {
            return action.type === "EVENT" && action.event_name === event_name
        }
    };
    yield takeEvery(sagaEventPattern("service_instance_subscribed"), startTimerWhenSubscribed);
}
module.exports = {run};