let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let bcrypt = require('bcryptjs');
let fetch = require("node-fetch");
let Promise = require("bluebird");

function* run(config, provide, channels) {
    let db = yield consume(channels.database);
    yield call(db.createTableIfNotExist, "webhooks", function (table) {
        table.increments();
        table.string('endpoint_url').unique().notNullable();
        table.string("health");
        table.boolean("async_lifecycle").notNullable().defaultTo(true);
        table.timestamps(true, true);
        console.log("Created 'webhooks ' table.");
    });

    //todo: possibly may need to give users ability to set these themselves...
    const headers = {
        "Content-Type": "application/json",
        "Accepts": "application/json"
    };

    let sendToWebhooks = (eventName) => async (event, sync_all = false) => {
        let webhooks = await db("webhooks").where(true, true);
        let webhook_responses = await Promise.reduce(webhooks, async (responses, webhook) => {
            console.log("before")
            let webhookRequest = fetch(webhook.endpoint_url, {method: "POST", body: JSON.stringify({event_name : eventName, event_data : event}), headers})
                .then(response => {
                    if (!response.ok) {
                        console.error("error making webhook request", response.statusText);
                    }
                    db("webhooks").where("id", webhook.id).update({health: response.statusText}).then(result => {

                    })
                    return response
                })
                .catch(error => {
                    let health = error.errno || error
                    db("webhooks").where("id", webhook.id).update({health}).then(result => {

                    })
                });

            //if its not async, store responses
            if (!webhook.async_lifecycle || sync_all) {
                try {
                    responses[webhook.endpoint_url] = await (await webhookRequest).json();
                }catch(e){
                    console.error("unable to get response from webhook: ", e);
                }
            }
            return responses
        }, {});
        return {webhook_responses};
    };

    let lifecycleHook = [
        {
            stage: "pre",
            run: sendToWebhooks("pre_provision")
        },
        {
            stage: "post",
            run: sendToWebhooks("post_provision")
        },
        {
            stage: "pre_decom",
            run: sendToWebhooks("pre_decommission")
        },
        {
            stage: "post_decom",
            run: sendToWebhooks("post_decommission")
        },
        {
            stage: "pre_reactivate",
            run: sendToWebhooks("pre_reactivate")
        },
        {
            stage: "post_reactivate",
            run: sendToWebhooks("post_reactivate")
        }
    ];


    let processWebhooks = async (req, res, next) => {
        let responses = await sendToWebhooks("test")({"event_name": "test", "event_data" : {"test" : "data"}}, true);
        res.json({responses : responses});
    }


    let routeDefinition = [
        {
            endpoint: "/webhooks/test",
            method: "post",
            middleware: [processWebhooks],
            permissions: [],
            description: "Test all webhooks"

        }
    ];
    yield provide({lifecycleHook, routeDefinition})
}

module.exports = {run};