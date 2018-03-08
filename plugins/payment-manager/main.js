let {call, put, all, select, fork, spawn, take, takeEvery} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let schedule = require('node-schedule');

function* startTimerWhenSubscribed(action) {
    let instance = action.event_object
    let plan = instance.get("payment_plan");
    let trial = 0;
    if(plan){
        trial = plan.trial_period_days;
    }
    if (trial) {
        let trialEnd = new Date(instance.get("subscribed_at") * 1000);
        trialEnd.setDate(trialEnd.getDate() + trial);

        let job = schedule.scheduleJob(trialEnd, trialExpiration(instance));
        console.log("TRIAL STARTED!");
    }
    if(instance.get("type") === "split"){
        return scheduleSplitsForInstance(instance);
    }
}


//function to create a new charge on an instance
async function addSplitCharge(split, instance, description){
    let Charge = require("../../models/charge");
    console.log("ADDING SPLIT CHARGE ", description);
    let chargeObject = {
        'user_id': instance.get('user_id'),
        'service_instance_id': instance.get('id'),
        'currency': instance.get('currency'),
        'amount': split.amount || 0,
        description,
        "subscription_id" : instance.get("subscription_id"),
        "approved" : true

    };

    //create new charge and approve it
    let newCharge = new Charge(await Charge.createPromise(chargeObject));
    try {
        await newCharge.approve()
    }catch(e){
        console.error("Error adding split charge", e);
        newCharge.data.approved = false;
        await newCharge.update();
    }
    //todo: error case?
}

//schedules splits that haven't been charged yet on an instance
async function scheduleSplitsForInstance(instance){
    let Charge = require("../../models/charge");
    let splits = instance.get("split_configuration") && instance.get("split_configuration").splits;
    if(instance.get("type") === "split" && splits){
        let splitCharges = await Charge.find({service_instance_id : instance.get("id"), description : {"like" : "SPLIT_%"}});
        //sort by charge_day and slice it by the number of already existing charges
        let splitsToSchedule = splits.sort(function (a, b) {
            return a.charge_day - b.charge_day;
        }).slice(splitCharges.length); //todo: rework this, there are edge cases that can give problems here

        for(let i in splitsToSchedule){

            let split = splitsToSchedule[i];
            let scheduledDate = new Date(instance.get("subscribed_at") * 1000);
            //set date to be the subscribed at date + the charge_day
            scheduledDate.setDate(scheduledDate.getDate() + split.charge_day);
            let splitNumber = (splitCharges.length + parseInt(i) + 1);
            let description = `SPLIT_${splitNumber}`
            console.log(scheduledDate, new Date());
            //if scheduled date has already passed, add a new charge
            if(scheduledDate <= (new Date()) || split.charge_day === 0){
                console.log("Charge needed", split);
                await addSplitCharge(split, instance, description);
            }else{
                console.log("Scheduling split", split, instance, description);

                //uncomment this to make all things schedule 10 seconds in future
                // scheduledDate = new Date();
                // scheduledDate.setSeconds(scheduledDate.getSeconds() + 10);

                //schedule job  that adds a charge at  the correct date
                let job = schedule.scheduleJob(scheduledDate, addSplitCharge.bind(null, split, instance,description));
            }
        }

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

function* scheduleSplits(){
    let ServiceInstance = require("../../models/service-instance");
    let Fund = require('../../models/fund');
    let instances = yield call(ServiceInstance.find, {"type" : "split", "not": {"subscription_id": null}});
    for (let instance of instances) {
        yield call(scheduleSplitsForInstance, instance);
    }
}
function* scheduleTrials(){
    let ServiceInstance = require("../../models/service-instance");
    let Fund = require('../../models/fund');
    let instances = yield call(ServiceInstance.find, {"not": {"subscription_id": null}});
    for (let instance of instances) {
        let plan = instance.get("payment_plan");
        let trial = 0;
        if(plan){
            trial = plan.trial_period_days;
        }
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
}

function* run(config, provide, channels) {
    let database = yield consume(channels.database);
    yield call(scheduleTrials)
    yield call(scheduleSplits)
    //process split payments

    //todo: reduce duplicate code - this chunk is in a bunch of places :(
    let sagaEventPattern = function (event_name) {
        return function (action) {
            return action.type === "EVENT" && action.event_name === event_name
        }
    };

    yield takeEvery(sagaEventPattern("service_instance_subscribed"), startTimerWhenSubscribed);
}
module.exports = {run};