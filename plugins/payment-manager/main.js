let {call, put, all, select, fork, spawn, take, takeEvery} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let schedule = require('node-schedule');


//main function
function* run(config, provide, channels) {
    let database = yield consume(channels.database);
    yield call(scheduleTrials);
    yield call(scheduleSplits);
    //process split payments

    //todo: reduce duplicate code - this chunk is in a bunch of places :(
    let sagaEventPattern = function (event_name) {
        return function (action) {
            return action.type === "EVENT" && action.event_name === event_name
        }
    };

    yield takeEvery(sagaEventPattern("service_instance_subscribed"), startTimerWhenSubscribed);
    yield takeEvery(sagaEventPattern("service_instance_trial_change"), refreshTrial);

}


//todo: this is a slightly dirty fix for older versions - should take this code out eventually?
function getTrialEnd(instance) {
    let plan = instance.get("payment_plan");
    let trialEnd = instance.get("trial_end");
    if (trialEnd === null && plan && plan.trial_period_days > 0) {
        trialEnd = new Date(instance.get("subscribed_at") * 1000);
        trialEnd.setDate(trialEnd.getDate() + plan.trial_period_days);
    } else if (trialEnd !== null) {
        trialEnd = new Date(instance.get("trial_end") * 1000);
    } else {
        return null;
    }
    return trialEnd;
}

function* startTimerWhenSubscribed(action) {
    let instance = action.event_object
    let trialEnd = getTrialEnd(instance);
    if (trialEnd) {
        let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));
    }
    if (instance.get("type") === "split") {
        return scheduleSplitsForInstance(instance);
    }
}


//function to create a new charge on an instance
async function addSplitCharge(split, instance, description) {
    let Charge = require("../../models/charge");
    console.log("ADDING SPLIT CHARGE ", description);
    let chargeObject = {
        'user_id': instance.get('user_id'),
        'service_instance_id': instance.get('id'),
        'currency': instance.get('currency'),
        'amount': split.amount || 0,
        description,
        "subscription_id": instance.get("subscription_id"),
        "approved": true

    };

    //create new charge and approve it
    let newCharge = new Charge(await Charge.createPromise(chargeObject));
    try {
        await newCharge.approve()
    } catch (e) {
        console.error("Error adding split charge", e);
        newCharge.data.approved = false;
        await newCharge.update();
    }
    //todo: error case?
}

//schedules splits that haven't been charged yet on an instance
async function scheduleSplitsForInstance(instance) {
    let Charge = require("../../models/charge");
    let splits = instance.get("split_configuration") && instance.get("split_configuration").splits;
    if (instance.get("type") === "split" && splits) {
        let splitCharges = await Charge.find({
            service_instance_id: instance.get("id"),
            description: {"like": "SPLIT_%"}
        });
        //sort by charge_day and slice it by the number of already existing charges
        let splitsToSchedule = splits.sort(function (a, b) {
            return parseInt(a.charge_day) - parseInt(b.charge_day);
        }).slice(splitCharges.length); //todo: rework this, there are edge cases that can give problems here

        for (let i in splitsToSchedule) {

            let split = splitsToSchedule[i];
            let scheduledDate = new Date(instance.get("subscribed_at") * 1000);
            //set date to be the subscribed at date + the charge_day
            scheduledDate.setDate(scheduledDate.getDate() + parseInt(split.charge_day));
            let splitNumber = (splitCharges.length + parseInt(i) + 1);
            let description = `SPLIT_${splitNumber}`
            console.log(scheduledDate, new Date());
            //if scheduled date has already passed, add a new charge
            if (scheduledDate <= (new Date()) || split.charge_day == 0) {
                console.log("Charge needed", split);
                await addSplitCharge(split, instance, description);
            } else {
                console.log("Scheduling split", split, instance, description)
                //uncomment this to make all things schedule 10 seconds in future
                // scheduledDate = new Date();
                // scheduledDate.setSeconds(scheduledDate.getSeconds() + 10);

                //schedule job  that adds a charge at  the correct date
                let job = schedule.scheduleJob(scheduledDate, addSplitCharge.bind(null, split, instance, description));
            }
        }

    }
}

function trialExpiration(instance) {
    return async function () {
        let ServiceInstance = require("../../models/service-instance");
        let currentInstance = (await ServiceInstance.find({id: instance.id}))[0];
        let trialEnd = getTrialEnd(currentInstance);
        if (trialEnd <= new Date()) {
            let Fund = require('../../models/fund');
            let fund = await Fund.findOne("user_id", currentInstance.get("user_id"));

            if (!fund.data) {
                console.log("TRIAL EXPIRED AND NO FUNDS, UNSUBSCRIBE!");
                instance.unsubscribe()
            } else {
                console.log("funds have been added, no unsubscribe needed");
            }
        } else {
            console.log("trial no longer expiring");
        }
    }
}

function* scheduleSplits() {
    let ServiceInstance = require("../../models/service-instance");
    let Fund = require('../../models/fund');
    let instances = yield call(ServiceInstance.find, {"type": "split", "not": {"subscription_id": null}});
    for (let instance of instances) {
        yield call(scheduleSplitsForInstance, instance);
    }
}

function* refreshTrial(action) {
    let instance = action.event_data;
    let trialEnd = getTrialEnd(instance);
    if (trialEnd) {
        let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));
    }


}

function* scheduleTrials() {
    let ServiceInstance = require("../../models/service-instance");
    let Fund = require('../../models/fund');
    let instances = yield call(ServiceInstance.find, {"not": {"subscription_id": null}});
    for (let instance of instances) {
        let trialEnd = getTrialEnd(instance);
        if (trialEnd !== null) {
            let fund = (yield call(Fund.find, {"user_id": instance.get("user_id")}))[0];
            if (!fund) {
                if (trialEnd <= (new Date())) {
                    instance.unsubscribe();
                } else {
                    console.log("no funds, setting expiration timer!");
                    let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));

                }
            }
        }

    }
}


module.exports = {run};