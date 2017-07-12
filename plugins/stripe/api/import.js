/**
 * Created by shar on 7/8/17.
 */

/**
 * Pseudo code for Stripe import process:
 *
 * USERS:
 * - Check if customer exists in database
 *  - If yes, move to SERVICE TEMPLATES section
 *  - If No:
 *      - Invite the user with the customer ID (make sure it send invite)
 *          - Pass in role for now. will automate this soon
 *      - FUND (Get fund from customer object):
 *          - Create a fund JSON
 *          - Create a fund and attach to user
 * SERVICE TEMAPLTES
 * - Loop through customer objects subscription and for each subscription do the following:
 *  - Check if there is a service instance with the subscription.id available
 *      - If no, perform the following actions
 *          - Check if there is a serviceTemplate category with name "uncategorized"
 *              - If yes, grab its id
 *              - If no, create it, then grab its id
 *          - Check the subscription.plan.name and see if any Service templates with that name exist
 *              - If yes, grab it
 *              - If no, create the service template, then grab its id
 *          SERVICE INSTANCES:
 *          - Create the service instance.
 *              - set the requested_by to the current user
 *              - set service instance status to running
 */

let mailer = require("../../../middleware/mailer");
let async = require('async');
let Logger = require('../models/logger');
let User = require('../../../models/user');
let ServiceInstance = require('../../../models/service-instance');
let Invoice = require('../../../models/invoice');
let Invitation = require('../../../models/invitation');
let Fund = require('../../../models/fund');
let ServiceTemplate = require('../../../models/service-template');
let ServiceCategory = require('../../../models/service-category');

module.exports = function(router, knex, stripe) {

    /**
     * This function will import all Stripe users to ServiceBot by looping through every customer object from Stripe.
     * @param last_id - Used for recursive calls
     * @returns {Promise}
     */
    let importStripeUsers = function (last_id) {
        let req_params = { limit: 100 };
        if (last_id !== null) { req_params['starting_after'] = last_id; }

        return new Promise(function (resolve, reject) {
            stripe().connection.customers.list(req_params, function (err, customers) {
                if(!err) {
                    Promise.all(customers.data.map(function (customer) {
                        return importUser(customer).catch(function (err) {
                            console.log(err);
                            return Promise.resolve(true);
                        });;
                    })).then(function () {
                        // Check for more, and recursively call importStripeUsers
                        if (customers.has_more) {
                            let last_customer = customers["data"][customers["data"].length - 1].id;
                            console.log(`Parsed all users until Customer ID ${last_customer}`);
                            return resolve(importStripeUsers(last_customer));
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
                                console.log(plans.data[plans.data.length - 1]);
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

    let importUser = function (customer) {
        return new Promise(function (resolve, reject) {
            User.findOne('customer_id', customer.id, function (user) {
                console.log(`Processing Customer ID: ${customer.id}`);
                if(!user.data) {
                    User.findOne('email', customer.email, function (user_by_email) {
                        let new_user = new User({
                            "email": customer.email,
                            "customer_id": customer.id,
                            "role_id": 3,
                            "status": "invited"
                        });
                        if(user_by_email.data) {
                            new_user.data.email = `${customer.email}-DUPLICATE-${customer.id}`;
                        }
                        //Create the user entity
                        new_user.create(function (err, user) {
                            if(!err) {
                                let invite = new Invitation({"user_id": user.get("id")});
                                invite.create((err, invite) => {
                                    //***dispatch an invite event
                                    return resolve(user);
                                });
                            } else {
                                //Reject if the user object cannot be obtained or created
                                return reject(err);
                            }
                        });
                    });
                } else {
                    return resolve(user);
                }
            });
        }).then(function (user) {
            return importFund(user, customer.sources);
        }).catch(function (err) {
            return new Promise(function (resolve, reject) {
                console.log(`FAILED => import user:`);
                console.log(err);
                return resolve(false);
            });
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
                    newPlan.description = plan.name;
                    newPlan.name = plan.id;
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

    let promiseServiceCategory = function (category_name = 'uncategorized') {
        return new Promise(function (resolve, reject) {
            ServiceCategory.findOne('name', 'uncategorized', function (category) {
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
            if(!subscription.plan) {
                let plan = subscription.items.data[0].plan;
                subscription.items.data.map(function (item_plan) {
                    plan.amount = parseInt(plan.amount) + parseInt(item_plan.plan.amount);
                });
                return resolve(plan);
            } else {
                return resolve(subscription.plan);
            }
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


    router.post(`/stripe/import`, function(req, res, next){
        importStripeUsers(null).then(function () {
            return importStripePlans();
        }).then(function () {
            return importStripeSubscriptions();
        }).then(function (result) {
            console.log(result);
            res.status(200).json(result);
        }).catch(function (err) {
            console.log('ERROR => Stripe import');
            console.log(err);
            res.status(400).json(err);
        });
    });
}