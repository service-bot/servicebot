
//let Announcement = require("../../../models/base/entity")("announcements");
let async = require('async');
let auth = require('../../../middleware/auth');
let Logger = require('../models/logger');
let User = require('../../../models/user');
let Stripe = require('../../../config/stripe');
let StripeValidator = require('../../../lib/stripeValidator');
let SystemOptions = require('../../../models/system-options');
let store = require("../../../config/redux/store")
module.exports = function(router, knex, stripe) {

    //Promise used for validating the Stripe API key change prior to the change.
    let promiseStripeReconfigure = function (stripe_secret, stripe_publishable) {
        return new Promise(function (resolve, reject) {
            //Validate the new Strip keys
            StripeValidator(stripe_publishable, stripe_secret, function(err, result){
                if(!err){
                    console.log('Stripe keys are valid. Continue...');
                    return resolve('Stripe keys are valid. Continue...');
                }else{
                    console.log(`ERROR validating Stripe keys - ${err}`);
                    return reject(`ERROR validating Stripe keys - ${err}`);
                }
            });
        }).then(function () {
            //Make sure both entered keys are on the same environment
            return new Promise(function (resolve, reject) {
                if(stripe_secret.slice(3,7) == stripe_publishable.slice(3,7)) {
                    console.log('Stripe keys are on the same environment. Continue...');
                    return resolve(true);
                } else {
                    console.log('ERROR: Stripe keys must both be on the same environment!');
                    return reject('ERROR: Stripe keys must both be on the same environment!');
                }
            });
        }).catch(function (err) {
            //Instantly fail the process
            return new Promise(function (resolve, reject) {
                return reject(err);
            });
        }).then(function () {
            //Check if the environment has changed from the previous Stripe keys:
            //If yes, initiate migration of the data. if no, change the keys without migration.
            return new Promise(function (resolve, reject) {
                if(!Stripe().stripe_secret_key){
                    console.log("No stripe key exists in current environment, proceed with migration");
                    return resolve(true);
                }
                if(stripe_secret.slice(3,7) === Stripe().stripe_secret_key.slice(3,7)) {
                    //Check the Stripe account ID of the old and the new keys
                    let NewStripe = require("stripe")(stripe_secret);
                    NewStripe.account.retrieve(function (err, new_stripe) {
                        if(!err) {
                            Stripe().connection.account.retrieve(function (err, old_stripe) {
                                if(!err) {
                                    if(new_stripe.id === old_stripe.id) {
                                        //They are both on the same account. Continue without migration
                                        console.log(`Both Stripe keys are on the same account: ${new_stripe.id}. Continue without migration...`);
                                        return resolve(false);
                                    } else {
                                        //They are on different accounts, initiate migration
                                        console.log(`Stripe keys belong to two different accounts. Initiate migration...`);
                                        return resolve(true);
                                    }
                                } else {
                                    //TODO: need to save Stripe account info in the database to ensure rolled keys or diactivated account
                                    //If the old account is not found, forget about migration and update
                                    console.log('Potential rolled keys. No old Stripe account found. Continue without migration...');
                                    return resolve(false);
                                }
                            });
                        } else {
                            console.log('Cannot retrieve new Stripe account info! Aborting the reconfiguration.');
                            return reject('Cannot retrieve new Stripe account info! Aborting the reconfiguration.');
                        }
                    });
                } else {
                    console.log('New Stripe environment is different than the existing one. Initiating migration...');
                    return resolve(true);
                }
            });
        }).catch(function (err) {
            //Instantly fail the process
            return new Promise(function (resolve, reject) {
                console.error(err);
                return reject(err);
            });
        });
    };

   let getStripeKeys = function (req, res) {
        SystemOptions.findOne('option', 'stripe_secret_key', function (option_secret_key) {
            SystemOptions.findOne('option', 'stripe_publishable_key', function (option_publishable_key) {
                if(!option_publishable_key.data){
                    return res.status(200).json({secret_key:"", publishable_key:""});
                }
                let secret_key = option_secret_key.data.value.substring(0,7) + '******' + option_secret_key.data.value.substring(option_secret_key.data.value.length-5,option_secret_key.data.value.length);
                let publishable_key = option_publishable_key.data.value;
                return res.status(200).json({secret_key: secret_key, publishable_key: publishable_key});
            });
        });
    };

    let getSPK = function (req, res) {
        SystemOptions.findOne('option', 'stripe_publishable_key', function (option_publishable_key) {
            if(!option_publishable_key.data){
                return res.status(200).json({spk:"NO KEY"});
            }
            let publishable_key = option_publishable_key.data.value;
            return res.status(200).json({spk: publishable_key});
        });
    };

    let preconfigure =  function (req, res) {
        let stripe_config = req.body;
        let stripe_publishable = stripe_config.stripe_public;
        let stripe_secret = stripe_config.stripe_secret;
        console.log('Checking pre-configuration of Stripe keys to: ', stripe_config);
        //Run the preconfigure promise
        promiseStripeReconfigure(stripe_secret, stripe_publishable).then(function (do_migration) {
            if(do_migration) {
                return res.status(200).json({message: 'Migration is needed.', do_migration: true});
            } else {
                return res.status(200).json({message: 'Reconfigurable without migration', do_migration: false});
            }
        }).catch(function (err) {
            return res.status(400).json({error: err});
        });
    };

    /**
     * This is the route to change Stripe API keys.
     */

    let reconfigure =  function(req, res){
        let stripe_config = req.body;
        let stripe_publishable = stripe_config.stripe_public;
        let stripe_secret = stripe_config.stripe_secret;
        let fullRemoval = stripe_config.full_removal;
        if(!fullRemoval) {
            fullRemoval = false;
        }
        console.log('NEW Stripe API Keys to configure: ', stripe_config);

        promiseStripeReconfigure(stripe_secret, stripe_publishable).then(function (do_migration) {
            console.log("Migration: ", do_migration);
            //Purge all user data
            return new Promise(function (resolve_purge, reject_purge) {
                console.log(`Run Stripe migration: ${do_migration}`);
                if(do_migration) {
                    User.findAll(true, true, function (users) {
                        Promise.all(users.map(function (user) {
                            return user.purgeData(fullRemoval, function (promisePurge) {
                                return promisePurge;
                            });
                        })).then(function () {
                            return resolve_purge(do_migration);
                        }).catch(function (err) {
                            console.log(`Purge process on old Stripe account failed. Continue without full removal... - Error: ${err}`)
                            return resolve_purge(do_migration);
                        });
                    });
                } else {
                    return resolve_purge (do_migration);
                }
            });
        }).then(async function (do_migration) {
            let keys = [{
                "option" : "stripe_secret_key",
                "value" : stripe_secret,
                "type": "payment",
                public: false
            },
            {
                "option" : "stripe_publishable_key",
                "value" : stripe_publishable,
                "type": "payment",
                public: false
            }]
            if(!Stripe().stripe_secret_key){
                await SystemOptions.batchCreate(keys);

            }else{
                await SystemOptions.batchUpdate(keys);

            }
            console.log("Stripe keys added to the database")
            let new_stripe_keys = {
                stripe_secret_key: stripe_secret,
                stripe_publishable_key: stripe_publishable
            };

            console.log('Updating the Stripe config keys to: ', new_stripe_keys);
            store.dispatchEvent("system_options_updated", new_stripe_keys)
            Stripe.setKeys(new_stripe_keys);

            return do_migration;
        }).then(function (do_migration) {
            return new Promise(function (resolve, reject) {
                if (do_migration) {
                    //Reconnect users
                    User.findAll(true, true, function (users) {
                        Promise.all(users.map(function (user) {
                            return user.promiseStripeReconnect();
                        })).then(function () {
                            return resolve(do_migration);
                        }).catch(function (err) {
                            console.error(err);
                            return reject(false);
                        });
                    });
                } else {
                    console.log('Bypassing user reconnection...');
                    return resolve(do_migration);
                }
            });
        }).then(function (do_migration) {
            return new Promise(function (resolve, reject) {
                if(do_migration) {
                    //Get upcoming invoices for every user
                    return resolve(do_migration);
                } else {
                    //TODO: importing the customer invoices.
                    //console.log('Bypassing upcoming invoice creation...');
                    return resolve(do_migration);
                }
            });
        }).then(function () {
            console.log('Reconfigure completed!');
            return res.status(200).json({message: 'Reconfigure completed!'});
        }).catch(function (err) {
            return res.status(400).json({error: err});
        });
    };

    return [
        {
            endpoint : "/stripe/reconfigure",
            method : "post",
            middleware : [reconfigure],
            permissions : ["can_administrate"],
            description : "Reconfigure Stripe account"

        },
        {
            endpoint : "/stripe/preconfigure",
            method : "post",
            middleware : [preconfigure],
            permissions : ["can_administrate"],
            description : "Preconfigure Stripe account"

        },
        {
            endpoint : "/stripe/keys",
            method : "get",
            middleware : [getStripeKeys],
            permissions : ["get_stripe_keys"],
            description : "Get stripe keys"
        },
        {
            endpoint : "/stripe/spk",
            method : "get",
            middleware : [getSPK],
            permissions : [],
            description : "Get stripe publishable key"
        }
    ];
}