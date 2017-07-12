
//let Announcement = require("../../../models/base/entity")("announcements");
let async = require('async');
let auth = require('../../../middleware/auth');
let Logger = require('../models/logger');
let User = require('../../../models/user');
let Stripe = require('../../../config/stripe');
let StripeValidator = require('../../../lib/stripeValidator');
let SystemOptions = require('../../../models/system-options');
let dispatchEvent = require("../../../config/redux/store").dispatchEvent
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
                if(stripe_secret.slice(3,7) == Stripe().stripe_secret_key.slice(3,7)) {
                    //Check the Stripe account ID of the old and the new keys
                    let NewStripe = require("stripe")(stripe_secret);
                    NewStripe.account.retrieve(function (err, new_stripe) {
                        if(!err) {
                            Stripe().connection.account.retrieve(function (err, old_stripe) {
                                if(!err) {
                                    if(new_stripe.id == old_stripe.id) {
                                        //They are both on the same account. Continue without migration
                                        console.log(`Both Stripe keys are on the same account: ${new_stripe.id}. Continue without migration...`);
                                        return resolve(false);
                                    } else {
                                        //They are on different accounts, initiate migration
                                        console.log(`Stripe keys belong to two different accounts. Initiate migration...`);
                                        return resolve(true);
                                    }
                                } else {
                                    console.log('Cannot retrieve old Stripe account info! Aborting the reconfiguration.');
                                    return reject('Cannot retrieve old Stripe account info! Aborting the reconfiguration.');
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
                return reject(err);
            });
        });
    };

    router.get(`/stripe/keys`, auth(), function (req, res) {
        SystemOptions.findOne('option', 'stripe_secret_key', function (option_secret_key) {
            SystemOptions.findOne('option', 'stripe_publishable_key', function (option_publishable_key) {
                let secret_key = option_secret_key.data.value.substring(0,7) + '******' + option_secret_key.data.value.substring(option_secret_key.data.value.length-5,option_secret_key.data.value.length);
                let publishable_key = option_publishable_key.data.value;
                return res.status(200).json({secret_key: secret_key, publishable_key: publishable_key});
            });
        });
    });

    router.post(`/stripe/preconfigure`, auth(), function (req, res) {
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
    });

    /**
     * This is the route to change Stripe API keys.
     */
    router.post(`/stripe/reconfigure`, auth(), function(req, res){
        let stripe_config = req.body;
        let stripe_publishable = stripe_config.stripe_public;
        let stripe_secret = stripe_config.stripe_secret;
        console.log('NEW Stripe API Keys to configure: ', stripe_config);

        promiseStripeReconfigure(stripe_secret, stripe_publishable).then(function (do_migration) {
            //Purge all user data
            return new Promise(function (resolve_purge, reject_purge) {
                console.log(`Run Stripe migration: ${do_migration}`);
                if(do_migration) {
                    User.findAll(true, true, function (users) {
                        Promise.all(users.map(function (user) {
                            return user.purgeData(function (promisePurge) {
                                return promisePurge;
                            });
                        })).then(function () {
                            return resolve_purge(do_migration);
                        }).catch(function (err) {
                            return reject_purge(`FATAL ERROR: Stripe migration failed during merge process - ${err}`);
                        });
                    });
                } else {
                    return resolve_purge (do_migration);
                }
            });
        }).then(function (do_migration) {
            //Update the Stripe secret key in the database
            return new Promise(function (resolve, reject) {
                SystemOptions.findOne('option', 'stripe_secret_key', function (option_secret_key) {
                    option_secret_key.data.value = stripe_secret;
                    option_secret_key.update(function (err, updated_option) {
                        if(!err) {
                            console.log(`Stripe Secret key updated in database: ${stripe_secret}`);
                            return resolve(do_migration);
                        } else {
                            console.log(`ERROR during Stripe secret key update in database ${err}`);
                            return reject(false);
                        }
                    });
                });
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    //Update the Stripe publishable key in the database
                    SystemOptions.findOne('option', 'stripe_publishable_key', function (option_publishable_key) {
                        option_publishable_key.data.value = stripe_publishable;
                        option_publishable_key.update(function (err, updated_option) {
                            if (!err) {
                                console.log(`Stripe Publishable key updated in database: ${stripe_publishable}`);
                                return resolve(do_migration);
                            } else {
                                console.log(`ERROR during Stripe publishable key update in database ${err}`);
                                return reject(false);
                            }
                        });
                    });
                });
            }).then(function () {
                //Set the Stripe keys in the Stripe config
                return new Promise(function (resolve, reject) {
                    let new_stripe_keys = {
                        stripe_secret_key: stripe_secret,
                        stripe_publishable_key: stripe_publishable
                    };

                    console.log('Updating the Stripe config keys to: ', new_stripe_keys);
                    dispatchEvent("system_options_updated", new_stripe_keys)
                    Stripe.setKeys(new_stripe_keys);
                    return resolve(do_migration);
                });
            });
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
                            console.log('ERROR: ', err);
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
                    console.log('Bypassing upcoming invoice creation...');
                    return resolve(do_migration);
                }
            });
        }).then(function () {
            console.log('Reconfigure completed!');
            return res.status(200).json({message: 'Reconfigure completed!'});
        }).catch(function (err) {
            return res.status(400).json({error: err});
        });
    });

    return router;
}