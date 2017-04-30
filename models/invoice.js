
let async = require('async');
let Users = require("./user");
let InvoiceLines = require("./invoice-line");
let Transactions = require("./transaction");
let ServiceInstances = require('./service-instance');
let BillingUpcoming = require('./base/entity')("user_upcoming_invoice");
let Stripe = require('../config/stripe');
let _ = require('lodash');
let references = [
    {"model": InvoiceLines, "referenceField": "invoice_id", "direction":"from"},
    {"model": Transactions, "referenceField": "invoice_id", "direction":"from"}
];
let Invoice = require("./base/entity")("user_invoices", references);


Invoice.prototype.refund = function (amount=null, reason=null, callback) {
    let self = this;
    if(self.get('charge')){
        //Get the charge object first
        Transactions.findOne('invoice_id', self.get('id'), function (charge) {
            charge.refund(amount, reason, function (err, refunded_charge) {
                callback(err, refunded_charge);
            });
        });
    } else {
        callback('Invoice does NOT have a charge. Cannot be refunded.');
    }

}

Invoice.prototype.sync = function (new_invoice, callback) {
    let self = this;
    let user_id = self.data.user_id;
    async.waterfall([
        //Remove the Transaction item
        function (callback) {
            if(self.data.charge) {
                Transactions.findOne('charge_id', self.data.charge, function (trans) {
                    if(trans.data) {
                        trans.delete(function (result) {
                            callback(null, result);
                        });
                    } else {
                        callback(null, "No charge to be processed.");
                    }
                });
            } else {
                callback(null, "No charge to be processed.");
            }
        },
        //Remove all invoice lines
        function (result, callback) {
            InvoiceLines.findAll('invoice_id', self.data.id, function (invoice_lines) {
                invoice_lines.map(function (invoice_line) {
                    invoice_line.delete(function (result) { return null; });
                });
                callback(null, invoice_lines);
            });
        },
        //Get the user object
        function (result, callback) {
            Users.findOne('id', user_id, function (user) {
                callback(null, user);
            });
        },
        function (user, callback) {
            //Update the invoice
            new_invoice.invoice_id = new_invoice.id;
            new_invoice.user_id = user_id;
            self.delete(function (result) {
                Invoice.insertInvoice(new_invoice, user, function (inserted) {
                    callback(null, inserted);
                });
            });
        }
    ], function (err, results) {
        callback(err, results);
    });
}


/**
 * This function will update and insert all new user invoices from Stripe to the database.
 * @param user_object - User Entity
 * @param callback - callback function
 */
Invoice.fetchUserInvoices = function (user_object, callback) {
    async.waterfall([
        function(callback) {
            //Getting the last inserted invoice
            Invoice.findAllByOrder('user_id', user_object.get('id'), 'date', 'desc', function (all_invoice_result) {
                callback(null, all_invoice_result);
            });
        },
        function(all_invoices, callback){
            //Stripe object to retrieve new invoices
            let invoice_obj = {
                customer : user_object.get('customer_id'),
                limit : 100
            };
            if(all_invoices.length > 0){
                invoice_obj.ending_before = all_invoices[0].get('invoice_id');
            }
            Stripe().connection.invoices.list(invoice_obj, function(err, invoices) {
                callback(err, invoices);
            });
        },
        function(invoices, callback){
            let err_array = [];
            invoices.data.forEach(raw_invoice => {
                Invoice.insertInvoice(raw_invoice, user_object, function (err, result) {
                    if(!err){
                        return;
                    } else {
                        err_array.push(err);
                        return;
                    }
                });
            });
            callback(err_array, invoices);
        }
    ], function(err, result) {
        callback(err, result);
    });
}

Invoice.insertInvoice = function (raw_invoice, user, callback) {
    //The given invoice is a Stripe formatted invoice.
    async.waterfall([
        function (callback) {
            //Add the service instance ID if the invoice is attached to an existing service.
            if(raw_invoice.subscription) {
                ServiceInstances.findOne('subscription_id', raw_invoice.subscription, function (service) {
                    if(service.data) {
                        raw_invoice.service_instance_id = service.data.id;
                    }
                    callback(null, raw_invoice);
                });
            }
        },
        function (raw_invoice, callback) {
            raw_invoice.invoice_id = raw_invoice.id;
            delete raw_invoice.id;
            raw_invoice.user_id = user.data.id;
            let invoice_entity = new Invoice(raw_invoice);
            invoice_entity.create(function (err, created_invoice) {
                created_invoice.data.references = {};
                callback(null, created_invoice);
            });
        },
        function (invoice, callback) {
            //Add Transaction array
            let transaction_array = [];
            Transactions.fetchCharge(invoice.data.charge, function (err, charge) {
                if(!err){
                    if(charge){
                        transaction_array.push(charge);
                    }
                    invoice.data.references.transactions = transaction_array;
                }
                callback(err, invoice);
            });
        },
        function (invoice, callback) {
            //Add all lines as reference
            let invoice_line_array = [];
            raw_invoice.lines.data.forEach(invoice_line => {
                invoice_line.line_item_id = invoice_line.id;
                delete invoice_line.id;
                invoice_line_array.push(invoice_line);
            });
            invoice.data.references.user_invoice_lines = invoice_line_array;
            callback(null, invoice);
        },
        function (invoice, callback) {
            let reference_data = invoice.data.references;
            for (let reference of references){
                if(!reference_data[reference.model.table] || reference_data[reference.model.table].length == 0){
                    return;
                } else {
                    let referenceData = reference_data[reference.model.table];
                    invoice.createReferences(referenceData, reference, function (modifiedEntity) {
                        return;
                    });
                }
            }
            callback(null, invoice);
        }
    ], function (err, result) {
        callback(err, result);
    });
}

/**
 * This function will update users upcoming invoice
 * @param user_object - User Entity
 * @param callback - callback function
 */
Invoice.fetchUpcomingInvoice = function (user_object, callback) {
    Stripe().connection.invoices.retrieveUpcoming(user_object.data.customer_id, function(err, upcoming_invoice) {
        BillingUpcoming.findOne("user_id", user_object.get('id'), function (result) {
            //If upcoming invoice record exits, update it, otherwise, create it
            if(result.data){
                if(upcoming_invoice) {
                    result.data.next_payment = upcoming_invoice.next_payment_attempt;
                }
                result.data.invoice_json = upcoming_invoice;
                result.update(function(err, update_result){
                    callback(update_result);
                });
            } else {
                upcoming_invoice_obj = {
                    user_id : user_object.data.id,
                    invoice_json : upcoming_invoice
                }
                upcoming_invoice_entity = new BillingUpcoming(upcoming_invoice_obj);
                upcoming_invoice_entity.create(function(err, created_result){
                    callback(created_result);
                })
            }
        });
    });
}

/**
 * This function will retrieve the upcoming invoice for the given user
 * @param user_object
 * @param callback
 */
Invoice.getUpcomingInvoice = function (user_object, callback) {
    BillingUpcoming.findOne("user_id", user_object.data.id, function(upcoming_invoice) {
         if(upcoming_invoice.data) {
             callback(upcoming_invoice.data.invoice_json);
         } else {
             callback(null);
         }
    });
}

module.exports = Invoice;