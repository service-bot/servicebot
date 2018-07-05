
//let Announcement = require("../../../models/base/entity")("announcements");

let async = require('async');
let Logger = require('../models/logger');
let User = require('../../../models/user');
let ServiceInstance = require('../../../models/service-instance');
let Invoice = require('../../../models/invoice');

module.exports = function(knex) {
    let stripe = require('../../../config/stripe');
    let store = require("../../../config/redux/store");

    /**
     * This function will retrieve an event from Stripe using the event id to validate post request
     * @param event_id - ID of the event coming from Stripe
     */
    let validateStripeEvent = function (event_id, callback){
        stripe().connection.events.retrieve(event_id, function(err, event) {
            callback(err, event);
        });
    };

    let invoiceCreatedEvent = function (event, callback) {
        User.findOne('customer_id', event.data.object.customer, function (user) {
            if(user.data) {
                Invoice.findOne('invoice_id', event.data.object.id, function (invoice) {
                    if(!invoice.data) {
                        Invoice.insertInvoice(event.data.object, user).then(function (result) {
                            Logger.log(event.id,'Invoice Created - Webhook from Stripe. Insert new Invoice.');
                            callback(result);
                        }).catch(function (err) {
                            console.log(err);
                            Logger.log(event.id,'FAILED => Invoice Creation - Webhook from Stripe. Insert new Invoice.');
                            callback(err);
                        });
                    } else {
                        callback('Invoice already exists.');
                    }
                });
            } else {
                callback('User does not exist.');
            }
        });
    }

    let invoiceUpdatedEvent = function (event, callback) {
        Invoice.findOne('invoice_id', event.data.object.id, function (invoice) {
            if(invoice.data) {
                invoice.sync(event.data.object).then(function (result) {
                    Logger.log(event.id,'Invoice Updated - Webhook from Stripe. Invoice Updated.');
                    callback(result);
                }).catch(function (err) {
                    console.log(err);
                    Logger.log(event.id,'FAILED => Invoice Updated - Webhook from Stripe. Invoice Updated.');
                    callback(err);
                });
            } else {
                callback('This invoice does not exist in the database.');
            }
        });
    };

    let invoiceFailedEvent = function (event, callback) {
        async.series([
            function (callback) {
                User.findOne('customer_id', event.data.object.customer, function (user) {
                    user.data.status = 'flagged';
                    user.update(function (err, result) {
                        callback(err, result);
                    });
                });
            },
            function (callback) {
                invoiceUpdatedEvent(event, function (result) {
                    callback(null, result);
                });
            }
        ]);
    };

    let customerDeletedEvent = function (event, callback) {
        User.findOne('customer_id', event.data.object.id, function (user) {
            if(user.data) {
                user.purgeData(false, function (result) {
                    user.data.status = 'suspended';
                    user.data.customer_id = null;
                    user.update(function (err, result) {
                        Logger.log(event.id,'Customer deleted - Webhook from Stripe. Set user activate to false.');
                        callback(result);
                    });
                });
            } else {
                callback('Customer not found.');
            }
        });
    }

    let subscriptionDeletedEvent = function (event, callback) {
        ServiceInstance.findOne('subscription_id', event.data.object.id, function(service) {
            if(service.data) {
                service.data.status = 'cancelled';
                service.data.subscription_id = null;
                service.update(function (err, result) {
                    Logger.log(event.id,'Subscription deleted - Webhook from Stripe.');
                    callback(result);
                });
            } else {
                callback('Service not found.');
            }
        });
    }


    // charge.* [Run the sync charge function for all charge updates]
    // customer.deleted [Set the user inactive]
    // [LATER] customer.source.* [Check the current default source of the user]
    // customer.subscription.deleted [Unsubscribe if subscription exists]
    // [LATER] customer.subscription.trial_will_end [Email user]
    // invoice.created [Add the invoice if its not already there]
    // invoice.payment_failed OR  source.failed[Mark user fund flagged]
    // invoice.updated [Sync the invoice]
    // ping

    let webhook = function(req, res, next){
        let event_id = req.body.id;
        async.waterfall([
            function (callback) {
                validateStripeEvent(event_id, function (err, result) {
                    if (err) {
                        res.status(404).send('Bad Stripe Event!');
                    } else {
                        callback(err, result);
                    }
                });
            },
            function (event, callback){
                if(event) {
                    //Check if the database has not processed this event before
                    Logger.findOne('event_id', event.id, function(found_event) {
                        if(!found_event.data){
                            callback(null, true, event);
                        } else {
                            res.status(200).send('Event already processed');
                        }
                    });
                    //Logger.log(event.id,'Im ready!');
                }
            },
            function (valid, event, callback) {
                if(valid) {
                    switch (event.type) {
                        case 'customer.deleted':
                            customerDeletedEvent (event, function (result) {
                                console.log(result);
                            });
                            break;
                        case 'customer.subscription.deleted':
                            subscriptionDeletedEvent (event, function (result) {
                                console.log(result);
                            });
                            break;
                        case 'invoice.created':
                            invoiceCreatedEvent (event, function (result) {
                                console.log(result);
                            });
                            break;
                        case 'invoice.updated':
                            invoiceUpdatedEvent(event, function (result) {
                                console.log(result);
                            });
                            break;
                        case 'invoice.payment_failed':
                            invoiceFailedEvent(event, function (user) {
                                console.log(user);
                                store.dispatchEvent("payment_failure", user);
                            });
                            break;
                        default:
                            console.log('This type of event is not yet supported by the system.');
                    }
                }
                //Send the response prior to processes
                res.sendStatus(200);
            }
        ]);
    };

    return {
        endpoint : "/stripe/webhook",
        method : "post",
        middleware : [webhook],
        permissions : [],
        description : "Stripe Webhook"

    };
}