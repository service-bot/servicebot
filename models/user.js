let async = require('async');
let _ = require('lodash');
let Stripe = require('../config/stripe');
let Role = require('./role');
let Fund = require('./fund');
let promisifyProxy = require("../lib/promiseProxy");
let references = [
    {"model": Role, "referenceField": "role_id", "direction": "to", "readOnly": true},
    {"model": Fund, "referenceField": "user_id", "direction": "from", "readOnly": true}
];
let User = require('./base/entity')("users", references);

/**
 * This function will return a promise that the user has a Stripe customer ID and is available in Stripe
 */
User.prototype.promiseValid = function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        if (!self.data.customer_id) {
            return reject('ERROR: User does not have a Stripe ID!');
        } else {
            Stripe().connection.customers.retrieve(self.data.customer_id, function (err, customer) {
                if (err) {
                    return reject('ERROR: User does not exist in Stripe!');
                }
                return resolve(customer.id);
            });
        }
    });
};

/**
 * This function will remove the users customer id from Stripe. It will validate the user in Stripe prior to removal.
 */
User.prototype.promiseStripeRemoval = function () {
    let self = this;
    return self.promiseValid()
        .then(function (customer_id) {
            return new Promise(function (resolve, reject) {
                Stripe().connection.customers.del(customer_id, function (err, confirmation) {
                    if (!err) {
                        console.log(`User ${self.data.id} was removed from Stripe!`);
                        return resolve(confirmation);
                    } else {
                        console.log(`Error during user ${self.data.id} removal in Stripe!`);
                        return reject(err);
                    }
                });
            });
        });
};

/**
 * This function will remove the customer reference in Stripe AND the database.
 * Use this function if need to completely disconnect the user from the Stripe account.
 */
User.prototype.promiseStripeDisconnect = async function () {
    let self = this;
    //Never remove the record from Stripe. Just internally
    return new Promise(function (resolve, reject) {
        self.data.customer_id = null;
        //To keep the users with the same status, we will not disconnect the user.
        //self.data.status = 'disconnected';
        self.update(function (err, result) {
            if (!err) {
                return resolve(`User ${self.data.id} was disconnected from Stripe`);
            } else {
                return reject(`ERROR while disconnecting user ${self.data.id} from Stripe`);
            }
        })
    });
};

/**
 * This function will generate a new Stripe customer account in Stripe (using the current stored API keys)
 * and will save the customer_id in the database.
 */
User.prototype.promiseStripeReconnect = function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        if (!self.data.customer_id) {
            let customer_obj = {
                email: self.data.email,
                description: `ServiceBot User: ${self.data.email}`
            };
            Stripe().connection.customers.create(customer_obj, function (err, customer) {
                if (!err) {
                    return resolve(customer.id);
                } else {
                    return reject(`ERROR cannot reconnect user ${self.data.id} to Stripe!`)
                }
            });
        } else {
            return reject(`User ${self.data.id} is still connected!`);
        }
    }).then(function (customer_id) {
        return new Promise(function (resolve, reject) {
            self.data.customer_id = customer_id;
            self.update(function (err, result) {
                if (!err) {
                    console.log(`User ${self.data.id} is now reconnected to Stripe`);
                    return resolve(`User ${self.data.id} is now reconnected to Stripe`);
                } else {
                    console.log(`ERROR during updating user customer_id in internal database. Remove manually from Stripe!`);
                    return reject(`ERROR during updating user customer_id in internal database. Remove manually from Stripe!`);
                }
            });
        });
    });
};

/**
 * Overriding the User create function to also add Stripe customer creation and attachment.
 */
let createWithStripe = function (options, callback) {
    let self = this;
    self.data.email = self.data.email.toLowerCase();
    let customer_obj = {
        email: self.data.email,
        description: `ServiceBot User: ${self.data.email}`
    };

    //Create Stripe Customer:
    Stripe(options).connection.customers.create(customer_obj, function (err, customer) {
        if (!err) {
            console.log(`Stripe Customer Created: ${customer.id}`);
            self.data.customer_id = customer.id;
            Role.findOne("role_name", "user", function (role) {
                if (!self.data.role_id) {
                    self.data.role_id = role.get("id");
                }
                //Use the Entity create to create the user
                self.create(function (err, created_user) {
                    console.log(`Create User: ${created_user}`);
                    callback(err, created_user);
                });
            })
        } else {
            //TODO: better error handling
            console.log(`ERROR: ${err}`, null);
        }
    });
};

//allows to pass option override, no longer relying 100% on store.
User.prototype.createWithStripe = new Proxy(createWithStripe, {
    apply: function (target, thisArg, argList) {
        if (argList.length === 2) {
            target.bind(thisArg)(...argList)
        } else {
            target.bind(thisArg)(undefined, ...argList);
        }
    }
});

User.prototype.updateWithStripe = async function () {
    let self = this;
    let store = require("../config/redux/store");
    self.data.email = self.data.email.toLowerCase();
    try {
        let customer_id = await this.promiseValid();

        //todo: if stripe update fails to update email, the whole function should fail
        await Stripe().connection.customers.update(customer_id, {email: self.data.email});
    } catch (e) {
        console.error(e);
    }
    let updatedUser = await self.update();
    store.dispatchEvent("user_updated", updatedUser);
    return updatedUser;
};

User.prototype.deleteWithStripe = function (callback) {
    let self = this;
    new Promise(function (resolve, reject) {
        self.delete(function (err, deleted_user) {
            if (err) {
                return reject('User cannot be deleted, must be suspended. User has connected records!');
            }
            return resolve(`User ${self.data.id} has been deleted from database!`);
        });
    }).then(function () {
        return self.promiseStripeRemoval()
    }).then(function () {
        callback(null, `User ID: ${self.data.id} has been removed.`);
    })
        .catch(function (err) {
            callback(err, null);
        });
};

/**
 * This function will remove all user provisioned data. The process is as follows:
 * 1- If the user has a valid Stripe account, it will be removed from Stripe.
 * 2- All user service instances will be removed.
 * 3- All user invoices will be removed.
 * 4- All user funds (Credit Card & Bank Account) will be removed.
 * @param callback
 * @returns {Promise.<TResult>}
 */
User.prototype.purgeData = function (fullRemoval = false, callback) {
    let self = this;
    return Promise.resolve(self.promiseStripeDisconnect()).catch(function (err) {
        console.log(`User ID: ${self.data.id} - ${err}`);
    }).then(function () {
        let Invoices = require('./invoice');
        return new Promise(function (resolveall, rejectall) {
            Invoices.findAll('user_id', self.data.id, function (invoices) {
                Promise.all(invoices.map(function (invoice) {
                    return new Promise(function (resolve, reject) {
                        invoice.delete(function (err, result) {
                            if (!err) {
                                console.log(`Invoice Removed: ${invoice.data.id}`);
                                return resolve(`Invoice Removed: ${invoice.data.id}`);
                            } else {
                                console.log(`ERROR removing Invoice: ${invoice.data.id} - ${err}`);
                                return resolve(`ERROR removing Invoice: ${invoice.data.id} - ${err}`);
                            }
                        });
                    });
                })).then(function () {
                    console.log(`All User ${self.data.id} invoices have been removed!`);
                    return resolveall(`All User ${self.data.id} invoices have been removed!`);
                });
            });
        });
    }).then(function () {
        let ServiceInstance = require('./service-instance');
        return new Promise(function (resolveall, rejectall) {
            ServiceInstance.findAll('user_id', self.data.id, function (services) {
                Promise.all(services.map(function (service) {
                    return new Promise(function (resolve, reject) {
                        service.deleteFiles(function (err) {
                            if (err) {
                                console.log(`ERROR removing files for Instance: ${service.data.id} - ${err}`);
                            }
                        });
                        service.delete(function (err, result) {
                            if (!err) {
                                console.log(`Service Removed: ${service.data.id}`);
                                return resolve(`Service Removed: ${service.data.id}`);
                            } else {
                                console.log(`ERROR removing Instance: ${service.data.id} - ${err}`);
                                return resolve(`ERROR removing Instance: ${service.data.id} - ${err}`);
                            }
                        });
                    });
                })).then(function () {
                    console.log(`All User ${self.data.id} services have been removed!`);
                    return resolveall(`All User ${self.data.id} services have been removed!`);
                }).catch(function (err) {
                    console.log(err);
                    return rejectall(`FAILED => All User ${self.data.id} services have been removed!`);
                });
            });
        });
    }).then(function () {
        let Funds = require('./fund');
        return new Promise(function (resolveall, rejectall) {
            Funds.findAll('user_id', self.data.id, function (funds) {
                Promise.all(funds.map(function (fund) {
                    return new Promise(function (resolve, reject) {
                        fund.delete(function (err, result) {
                            if (!err) {
                                console.log(`Fund Removed: ${fund.data.id}`);
                                return resolve(`Fund Removed: ${fund.data.id}`);
                            } else {
                                console.log(`ERROR removing Fund: ${fund.data.id} - ${err}`);
                                return resolve(`ERROR removing Fund: ${fund.data.id} - ${err}`);
                            }
                        });
                    });
                })).then(function () {
                    console.log(`All User ${self.data.id} funds have been removed!`);
                    return resolveall(`All User ${self.data.id} funds have been removed!`);
                }).catch(function (err) {
                    console.log(err);
                    return rejectall(`FAILED => All User ${self.data.id} funds have been removed!`);
                });
            });
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            //Make sure to not remove any admins.
            if (fullRemoval === 'true' && self.data.role_id === 3 && self.data.id !== 1) {
                self.delete(function (err, deleted_user) {
                    if (err) {
                        return reject('User cannot be deleted, must be suspended. User has connected records!');
                    }
                    return resolve(`User ${self.data.id} has been deleted from the internal database!`);
                });
            } else {
                return resolve(`User ${self.data.id} was not deleted internally. Record kept.`)
            }
        });
    }).then(function () {
        callback(new Promise(function (resolve, reject) {
            return resolve('Continue.');
        }));
    }).catch(function (err) {
        callback(new Promise(function (resolve, reject) {
            return reject(err);
        }))
    });
};

/**
 * This function will cancel all users services in Stripe and internal database. Then will mark the user as suspended.
 * @param callback - Final suspension result, or error.
 */
//THERES NO CALLBACK
//THIS WAS CHANGED BUT CALLBACK NOT REMOVED
User.prototype.suspend = async function () {
    let self = this;
    console.log('User status: ', self.data.status);
    if (self.data.status !== 'invited' && self.data.status !== 'suspended') {
        let ServiceInstances = require('./service-instance');
        let CancellationRequest = require("./service-instance-cancellation");
        await CancellationRequest.batchDelete({
            "user_id": self.data.id,
        });

        let instancesToCancel = await ServiceInstances.find({
            "user_id": self.data.id
        });

        for (let instance of instancesToCancel) {
            await instance.unsubscribe();
        }
        self.data.status = "suspended";
        return await self.update();

    }
    else {
        throw 'User can not be invited or already suspended'
    }
};

/**
 * This function marks a users status from suspended to active.
 * @param callback - updated user, or error.
 */
User.prototype.unsuspend = function (callback) {
    let self = this;
    if (self.data.status === 'suspended' && self.data.customer_id) {
        self.data.status = 'active';
        self.update(function (err, user) {
            if (!err) {
                callback(null, user);
            } else {
                callback(err, null);
            }
        });
    }
    else {
        if (!self.data.customer_id) {
            callback('User is deleted in Stripe', null);
        } else {
            callback('User is not suspended', null);
        }
    }
};

//TODO: Implement User.prototype.update override once the above create is simplified. Implement when doing user setting page.

/**
 * Override of the "findOnRelative" function to filter out passwords for users.
 */
//TODO maybe have to override all FInds for user if we never want password. (Maybe use a solution similar to next() for filtering)
User.findOnRelative = function (key, value, callback) {
    User.findAll(key, value, function (result) {
        let noPassword = result.map(function (entity) {
            delete entity.data.password;
            return entity
        });
        callback(noPassword);
    })
};



module.exports = User;
