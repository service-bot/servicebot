let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

function* run(config, provide, channels) {
    let database = yield consume(channels.database);

    let messageManager = {
        send : async function(to_id, from_id, service_instance_id=0, message, subject="New message on your service"){
            //todo: mailer needs to be a server, messages should be direct DB Stuff once all the model stuff is moved

            let Messages  = require("../../models/service-instance-message");
            let mailer = require('../../lib/mailer');

            let newMessage = await Messages.createPromise({"user_id" : from_id, service_instance_id, message})
            let user = (await database("users").where("id", to_id))[0];
            mailer(user.email, message, subject);
            return newMessage;
        },
        getInstanceMessages: (instance_id)=>{},
        getUserMessages  : (userId) => {},
        getSentMessages : (userId) => {},

    };

    yield provide({messageManager});
}
module.exports = {run};