
let async = require('async');
let _ = require('lodash');
let Charge = require("./base/entity")("charge_items");
let Stripe = require('../config/stripe');
let User = require('./user');
let promiseProxy = require("../lib/promiseProxy");

/**
 * Function to approve an individual charge item on the database and Stripe
 */
let approve = function (callback) {
    let self = this;

    User.findById(self.data.user_id, function (user_object) {
        let ServiceInstance = require('./service-instance');
        //Only approve if the charge is attached to an instance
        ServiceInstance.findOne('id',self.data.service_instance_id, function (service) {
            //Initiate the charge fee
            let charge_item = {
                customer : user_object.data.customer_id,
                amount: self.data.amount,
                currency: self.data.currency,
                description: self.data.description,
                subscription: service.data.subscription_id
            };
            //Approve charge in Stripe
            Stripe().connection.invoiceItems.create(charge_item, function(err, invoiceItem) {
                //Change the status in the database to approved
                if(!err){
                    //Get the current start billing date of the subscription
                    Stripe().connection.subscriptions.retrieve(service.data.subscription_id, function(subscription_err, subscription) {
                        if(!subscription_err){
                            self.data.approved = true;
                            self.data.item_id = invoiceItem.id;
                            self.data.period_start = subscription.current_period_start;
                            self.data.period_end = subscription.current_period_end;
                            //Update the Charge item in the database
                            self.update(function () {
                                callback(null, invoiceItem);
                            });
                        } else {
                            console.error(`Error retrieving subscription detail from Stripe ${err}`);
                            callback(subscription_err);
                        }
                    });
                } else {
                    console.error(`Error adding charge item to Stripe ${err}`);
                    callback(err);
                }
            });
        });
    });
}

/**
 * Function to cancel the charge item and delete it from the database and Stripe
 */
Charge.prototype.cancel = function (callback) {
    let self = this;
    let currentTimestamp = Math.ceil(_.now()/1000);
    async.series([
        function (callback) {
            if((self.data.period_end < currentTimestamp) && self.data.period_end){
                let err = 'Charge has already been processed. Cannot delete! Please process refund.';
                callback(err, null);
            } else {
                let output = 'Charge is removable';
                callback(null, output);
            }
        },
        function (callback) {
            //If the invoice charge item has not been applied yet, then remove it from stripe
            if(self.data.period_end > currentTimestamp){
                Stripe().connection.invoiceItems.del(self.data.item_id, function(err, confirmation){
                    callback(err, confirmation);
                });
            } else {
               let output = 'Stripe removal bypassed.';
                callback(null, output);
            }
        },
        function (callback) {
            //Finally remove the charge from the database.
            self.delete(function(result){
                let output = 'Charge has been removed from database.';
                callback(null, output);
            });
        }
    ], function (err, result) {
        if(!err){
            console.log(`Charge has been removed! - ${result}`);
            callback(result);
        } else {
            callback(err);
        }
    });
}

/**
 * Override of the "findOnRelative" function to filter charges for the current billing period and unapproved ones.
 */
/* Commenting out this code to allow all charges to be attached to the service instance
Charge.findOnRelative = function(key, value, callback){
    let currentTimestamp = Math.ceil(_.now()/1000);
    Charge.findAll(key, value, function(props){
        //Filter the result to only current billing period and unapproved items.
        callback(props.filter(function(charge_object) {
            let include = false;
            if((charge_object.data.period_end > currentTimestamp) || (!charge_object.data.approved)){
                include = true;
            }
            return include;
        }));
    });
};*/


Charge.prototype.approve = promiseProxy(approve, false);
module.exports = Charge;