let {call, put, all, select, fork, spawn, take, takeEvery} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

//this plugin will change in future.. for now handles basic hooks into stages of a service lifecycle
function* run(config, provide, channels) {

    let lifecycles = {
        pre : [],
        post : []
    }

    //collect lifecycle hooks
    yield fork(function* () {
        while(true){
            let hook = yield consume(channels.lifecycleHook);
            lifecycles[hook.stage].push(hook);
        }
    })

    let lifecycleManager = {
        preProvision : async function({request, template}){
            for(let hook of lifecycles.pre){
                await hook.run({request, template});
            }
        },
        postProvision : async function({request, template, instance}){
            for(let hook of lifecycles.post){
                await hook.run({request, template,instance});
            }

        }
    };
    yield provide({lifecycleManager})

};
module.exports = {run};