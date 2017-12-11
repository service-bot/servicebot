let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let bcrypt = require('bcryptjs');

function* run(config, provide, channels) {
    let db = yield consume(channels.database);
    let userProviders = {
        "local": {
            update : async function(oldUser, newUserData){
                newUserData.id = oldUser.get("id");
                if (newUserData.password) {
                    newUserData.password = bcrypt.hashSync(newUserData.password, 10);
                }
                Object.assign(oldUser.data, newUserData);
                console.log("updating the user");
                try {
                    let result = await oldUser.updateWithStripe();
                    delete result.password;
                    return {
                        message: 'User is successfully updated',
                        results: result
                    };
                } catch (e) {
                    return {error : e};
                }

            },
            authenticate : function(user, password){
                if (!bcrypt.compareSync(password, user.get("password"))) {
                    throw "Invalid username/password"
                }
            }
        }
    };
    let userManager = {
        update: async function (user, userData) {
            if(user.data.id){
                try {
                    let provider = user.data.provider;
                    delete userData.provider;
                    if (provider !== "local" && userProviders[provider] && userProviders[provider].update ) {
                        let providerResult = await userProviders[provider].update(user, userData);
                        console.log("PROVIDER RESULT\n\n", providerResult);
                    }
                    return await userProviders.local.update(user, userData);
                } catch (e) {
                    return {error: e};
                }


            }
        },
        authenticate: async function (user, password) {
            if(user.data.id) {
                let provider = user.data.provider || "local";
                return await userProviders[provider].authenticate(user, password);
            }
        }
    };
    yield provide({userManager});

    while (true) {
        let userProvider = yield consume(channels.userProvider);
        userProviders[userProvider.name] = userProvider;
    }


};
module.exports = {run};