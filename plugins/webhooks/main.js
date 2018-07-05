let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let bcrypt = require('bcryptjs');
let fetch = require("node-fetch");
let Promise = require("bluebird");
const crypto = require('crypto');
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

            let parsedEvent = Object.entries(event).reduce((acc, [key, eventValue]) => {
                acc[key] = eventValue.data ? eventValue.data : eventValue;
                return acc;
            }, {});
            let eventPayload = JSON.stringify({event_name : eventName, event_data : parsedEvent});
            let hmac = generateHmac(eventPayload, process.env.SECRET_KEY);
            let webhookRequest = fetch(webhook.endpoint_url, {method: "POST", body: eventPayload, headers: {...headers, "X-Servicebot-Signature" : hmac}})
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

    //todo: make this not hardcoded?
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
        },
        {
            stage: "pre_property_change",
            run: sendToWebhooks("pre_property_change")
        },
        {
            stage: "post_property_change",
            run: sendToWebhooks("post_property_change")
        }

    ];


    let processWebhooks = async (req, res, next) => {
        let responses = await sendToWebhooks("test")({"event_name": "test", "event_data" : {"test" : "data"}}, true);
        res.json({responses : responses});
    }

    let generateHmac = function(body, secret){
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(body);
        return hmac.digest('hex');
    };


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