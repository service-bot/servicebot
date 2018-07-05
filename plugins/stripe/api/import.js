let async = require('async');
let Logger = require('../models/logger');
let User = require('../../../models/user');
let ServiceInstance = require('../../../models/service-instance');
let Invitation = require('../../../models/invitation');
let Fund = require('../../../models/fund');
let ServiceTemplate = require('../../../models/service-template');
let ServiceCategory = require('../../../models/service-category');
let Invoice = require('../../../models/invoice');
let dispatchEvent = require("../../../config/redux/store").dispatchEvent;
let stripe = require('../../../config/stripe');


module.exports = function(knex) {

    /**
     * This function will import all Stripe users to ServiceBot by looping through every customer object from Stripe.
     * @param last_id - Used for recursive calls
     * @returns {Promise}
     */
    let importStripeUsers = function (last_id, notifyUsers, protocol, host) {
        let req_params = { limit: 100 };
        if (last_id !== null) { req_params['starting_after'] = last_id; }

        return new Promise(function (resolve, reject) {
            console.log(stripe)
            stripe().connection.customers.list(req_params, function (err, customers) {
                if(!err) {
                    Promise.all(customers.data.map(function (customer) {
                        return importUser(customer, notifyUsers, protocol, host).catch(function (err) {
                            console.log(err);
                            return Promise.resolve(true);
                        });
                    })).then(function () {
                        // Check for more, and recursively call importStripeUsers
                        if (customers.has_more) {
                            let last_customer = customers["data"][customers["data"].length - 1].id;
                            console.log(`Parsed all users until Customer ID ${last_customer}`);
                            return setTimeout(resolve,1000,importStripeUsers(last_customer, notifyUsers, protocol, host));
                        } else {
                            console.log(`All users and data have been imported.`);
                            return resolve(true);
                        }
                    });
                } else {
                    return reject('Cannot make the API call to retrieve customers.');
                }
            });
        });
    };

    /**
     *
     * @param last_id
     */
    let importStripePlans = function (last_id) {
        let req_params = { limit: 100 };
        if (last_id !== null) { req_params['starting_after'] = last_id; }

        return promiseServiceCategory().then(function (category) {
            return new Promise(function (resolve, reject) {
                stripe().connection.plans.list(req_params, function (err, plans) {
                    if(!err) {
                        Promise.all(plans.data.map(function (plan) {
                            return importServiceTemplate(category, plan).catch(function (err) {
                                console.log(err);
                                return Promise.resolve(true);
                            });;
                        })).then(function () {
                            // Check for more, and recursively call importStripePlans
                            if (plans.has_more) {
                                let last_plan = plans.data[plans.data.length - 1].id;
                                console.log(`Parsed all plans until Plan ID ${last_plan}`);
                                return setTimeout(resolve,1000,importStripePlans(last_plan));
                            } else {
                                console.log(`All plans have been imported.`);
                                return resolve(true);
                            }
                        });
                    } else {
                        console.log(err);
                        return resolve(true);
                        //return reject('Cannot make the API call to retrieve Plans.');
                    }
                });
            });
        });
    };

    /**
     *
     * @param last_id
     * @returns {Promise}
     */
    let importStripeSubscriptions = function (last_id) {
        let req_params = { limit: 100 };
        if (last_id !== null) { req_params['starting_after'] = last_id; }

        return new Promise(function (resolve, reject) {
            stripe().connection.subscriptions.list(req_params, function (err, subscriptions) {
                if(!err) {
                    Promise.all(subscriptions.data.map(function (subscription) {
                        return importServiceInstance(subscription).catch(function (err) {
                            console.log(err);
                            return Promise.resolve(true);
                        });
                    })).then(function () {
                        // Check for more, and recursively call importStripePlans
                        if (subscriptions.has_more) {
                            let last_subscription = subscriptions["data"][subscriptions["data"].length - 1].id;
                            console.log(`Parsed all subscriptions until Plan ID ${last_subscription}`);
                            return setTimeout(resolve,1000,importStripeSubscriptions(last_subscription));
                        } else {
                            console.log(`All subscriptions have been imported.`);
                            return resolve(true);
                        }
                    });
                } else {
                    return reject('Cannot make the API call to retrieve Plans.');
                }
            });
        });
    };

    let importUser = function (customer, notifyUsers, protocol, host) {
        return new Promise(function (resolve, reject) {
            User.findOne('customer_id', customer.id, function (user) {
                if(!user.data) {
                    //get default_user_role
                    let store = require('../../../config/redux/store');
                    let globalProps = store.getState().options;
                    let roleId = globalProps['default_user_role'];
                    User.findOne('email', customer.email, function (user_by_email) {
                        let new_user = new User({
                            "email": customer.email,
                            "customer_id": customer.id,
                            "role_id": roleId,
                            "status": "invited"
                        });
                        //Create the user entity
                        new_user.create(function (err, user) {
                            if(!err) {
                                let invite = new Invitation({"user_id": user.get("id")});
                                invite.create((err, result) => {
                                    //***dispatch an invite event
                                    if(notifyUsers) {
                                        console.log(`going to send email to stripe invited user ${user.get('email')}`);
                                        let apiUrl = protocol + '://' + host + "/api/v1/users/register?token=" + result.get("token");
                                        let frontEndUrl = protocol + '://' + host + "/invitation/" + result.get("token");
                                        console.log(frontEndUrl);
                                        user.set('url', frontEndUrl);
                                        user.set('api', apiUrl);
                                        store.dispatchEvent("user_invited", user);
                                    }
                                    return resolve(user);
                                });
                            } else {
                                new_user.data.email = `${customer.email}-DUPLICATE-${customer.id}`;
                                new_user.create(function (err, user_retry) {
                                    if(!err) {
                                        return resolve(user_retry);
                                    } else {
                                        //Reject if the user object cannot be obtained or created
                                        return reject(err);
                                    }
                                });
                            }
                        });
                    });
                } else {
                    return resolve(user);
                }
            });
        }).then(function (user) {
            return importFund(user, customer.sources);
        });
    };

    let importFund = function (user, user_sources) {
        return new Promise(function (resolve, reject) {
            if(user_sources.data.length > 0) {
                Fund.findOne('user_id', user.data.id, function (fund) {
                    if(!fund.data) {
                        let fund_source = {
                            id: 'Stripe-Imported',
                            flagged: false
                        };
                        fund_source[user_sources.data[0].object] = user_sources.data[0];
                        fund_source.type = user_sources.data[0].object;
                        let fund_obj = new Fund({
                            'user_id': user.data.id,
                            'source': fund_source
                        });
                        fund_obj.create((err, result) => { return resolve(true); });
                    } else {
                        return resolve(false);
                    }
                });
            } else {
                return resolve(false);
            }
        });
    };

    let importServiceTemplate = function (category, plan) {
        return new Promise(function (resolve, reject) {
            ServiceTemplate.findOne('name', plan.id, function (template) {
                if(template.data) {
                    return resolve(template);
                } else {
                    return resolve(false);
                }
            })
        }).then(function (template) {
            return new Promise(function (resolve, reject) {
                if(!template) {
                    let newPlan = Object.assign({}, plan);
                    delete newPlan.id;
                    newPlan.category_id = category.data.id;
                    newPlan.created_by = 1;
                    newPlan.description = plan.name || plan.nickname || "Imported from Stripe";
                    newPlan.name = plan.name || plan.nickname || plan.id;
                    let template = new ServiceTemplate(newPlan);
                    template.create((err, template) => {
                        if(err){
                            console.error(err);
                        }
                        return resolve(template); });
                } else {
                    return resolve(template);
                }
            });
        });
    };

    let promiseServiceCategory = function (category_name = 'Uncategorized') {
        return new Promise(function (resolve, reject) {
            ServiceCategory.findOne('name', 'Uncategorized', function (category) {
                if(!category.data) {
                    let category_obj = new ServiceCategory({
                        'name': category_name,
                        'description': 'Stripe Import Created Category'
                    });
                    category_obj.create((err, category) => { return resolve(category); });
                } else {
                    return resolve(category);
                }
            });
        });
    };
    
    let importServiceInstance = function (subscription) {
        return new Promise(function (resolve, reject) {
            //Make sure service does not already exist
            ServiceInstance.findOne('subscription_id', subscription.id, function (service) {
                if(!service.data) {
                    return resolve(true);
                } else {
                    return reject('Service already exists in ServiceBot!');
                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                if(!subscription.plan) {
                    let plan = subscription.items.data[0].plan;
                    let amount = 0;
                    subscription.items.data.map(function (item_plan) {
                        amount += parseInt(item_plan.plan.amount);
                    });
                    plan.amount = amount;
                    return resolve(plan);
                } else {
                    return resolve(subscription.plan);
                }
            })
        }).then(function (plan) {
            return new Promise(function (resolve, reject) {
                let service = { payment_plan: plan };
                User.findOne('customer_id', subscription.customer, function (user) {
                    if(user.data) {
                        service.user_id = user.data.id;
                        service.requested_by = user.data.id;
                        service.name = plan.name;
                        service.description = plan.statement_descriptor;
                        service.subscription_id = subscription.id;
                        service.status = 'running';
                        return resolve(service);
                    } else {
                        return reject('User was not found! Service will not be created.');
                    }
                });
            });
        }).then(function (service) {
            return new Promise(function (resolve, reject) {
                ServiceTemplate.findOne('name', service.payment_plan.id, function (template) {
                    if(template.data) {
                        service.service_id = template.data.id;
                    }
                    return resolve(service);
                });
            });
        }).then(function (service) {
            return new Promise(function (resolve, reject) {
                let service_instance = new ServiceInstance(service);
                service_instance.create((err, instance) => { return resolve(instance); });
            });
        });
    };

    let getAllUserInvoices = function () {
        return new Promise(function (resolve, reject) {
            User.findAll(true, true, function (users) {
                Promise.all(users.map(function (user) {
                    return Invoice.fetchUserInvoices(user);
                })).then(function () {
                    return resolve(true);
                }).catch(function (err) {
                    console.log(err);
                    return resolve(err);
                });
            });
        });
    };


    let importMiddleware = function(req, res, next){
        let protocol = req.protocol;
        let host = req.hostname;
        let notifyUsers = false;
        if (req.body.hasOwnProperty("notifyUsers")) {
            console.log("notify users is set to " + req.body.notifyUsers);
            notifyUsers = req.body.notifyUsers;
        }
        importStripeUsers(null, notifyUsers, protocol, host).then(function () {
            return importStripePlans();
        }).then(function () {
            return importStripeSubscriptions();
        }).then(function () {
            return getAllUserInvoices();
        }).then(function (result) {
            console.log(result);
            res.status(200).json(result);
        }).catch(function (err) {
            console.log('ERROR => Stripe import');
            console.log(err);
            res.status(400).json(err);
        });
    };

    return {
                endpoint : "/stripe/import",
                method : "post",
                middleware : [importMiddleware],
                permissions : ["can_administrate"],
                description : "Imports data from stripe"
    };
};