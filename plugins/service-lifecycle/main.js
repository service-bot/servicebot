let {call, put, all, select, fork, spawn, take, takeEvery} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

//this plugin will change in future.. for now handles basic hooks into stages of a service lifecycle
//todo: somehow merge lifecycle management into the event system... too much similar functionality in different systems
function* run(config, provide, channels) {

    let lifecycles = {
        pre : [],
        post : [],
        pre_decom : [],
        post_decom : [],
        pre_reactivate : [],
        post_reactivate : [],
        pre_property_change : [],
        post_property_change : [],
        pre_payment_structure_change: [],
        post_payment_structure_change: [],
        post_seat_created: [],
        post_seat_deleted: []

    }

    //collect lifecycle hooks
    yield fork(function* () {
        while(true){
            let hook = yield consume(channels.lifecycleHook);
            lifecycles[hook.stage].push(hook);
        }
    });

    let lifecycleManager = {
        preProvision : async function({request, template}){
            for(let hook of lifecycles.pre){
                await hook.run({request, template});
            }
        },
        postProvision : async function({request, template, instance}){
            let result = {}
            for(let hook of lifecycles.post){
                let hookresult = await hook.run({request, template,instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        preDecommission : async function({instance}){
            let result = {}
            for(let hook of lifecycles.pre_decom){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postDecommission : async function({instance}){
            let result = {}
            for(let hook of lifecycles.post_decom){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        preReactivate : async function({instance}){
            let result = {}
            for(let hook of lifecycles.pre_reactivate){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postReactivate : async function({instance}){
            let result = {}
            for(let hook of lifecycles.post_reactivate){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        prePropertyChange : async function({instance, property_updates}){
            let result = {}
            for(let hook of lifecycles.pre_property_change){
                let hookresult = await hook.run({instance, property_updates});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postPropertyChange : async function({instance}){
            let result = {}
            for(let hook of lifecycles.post_property_change){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        prePaymentStructureChange : async function({instance, payment_structure_template}){
            let result = {}
            for(let hook of lifecycles.pre_payment_structure_change){
                let hookresult = await hook.run({instance, payment_structure_template});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postPaymentStructureChange : async function({instance}){
            let result = {}
            for(let hook of lifecycles.post_payment_structure_change){
                let hookresult = await hook.run({instance});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postSeatCreated : async function({seat}){
            let result = {}
            for(let hook of lifecycles.post_seat_created){
                let hookresult = await hook.run({seat});
                result = {...result, ...hookresult};
            }
            return result;

        },
        postSeatDeleted : async function({seat}){
            let result = {}
            for(let hook of lifecycles.post_seat_deleted){
                let hookresult = await hook.run({seat});
                result = {...result, ...hookresult};
            }
            return result;
        }




    };
    yield provide({lifecycleManager})

};
module.exports = {run};