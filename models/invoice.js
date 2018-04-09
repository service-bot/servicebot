
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

Invoice.prototype.sync = function (new_invoice) {
    let self = this;
    let user_id = self.data.user_id;
    //Remove the transaction item
    return new Promise(function (resolve, reject) {
        if(self.data.charge) {
            Transactions.findOne('charge_id', self.data.charge, function (trans) {
                if(trans.data) {
                    trans.delete(function (err, result) {
                        if(!err) {
                            return resolve(result);
                        } else {
                            return reject(err);
                        }
                    });
                } else {
                    return resolve('No charge was found');
                }
            });
        } else {
            return resolve('No charge to be processed.');
        }
    }).then(function (result) {
        //Remove all invoice lines
        return new Promise(function (resolveall, rejectall) {
            InvoiceLines.findAll('invoice_id', self.data.id, function (invoice_lines) {
                Promise.all(invoice_lines.map(function (invoice_line) {
                    return new Promise(function (resolve, reject) {
                        invoice_line.delete(function (err, result) {
                            if(!err) {
                                return resolve(result);
                            } else {
                                return reject(err);
                            }
                        });
                    });
                })).then(function () {
                    console.log('Invoice lines deleted');
                    return resolveall('Invoice lines deleted');
                }).catch(function (err) {
                    return rejectall(err);
                });
            });
        });
    }).then(function (result) {
        //Remove the old invoice and insert the new one
        return new Promise(function (resolve, reject) {
            Users.findOne('id', user_id, function (user) {
                //Update the invoice
                new_invoice.invoice_id = new_invoice.id;
                new_invoice.user_id = user_id;
                self.delete(function (err, result) {
                    if(!err) {
                        return Invoice.insertInvoice(new_invoice, user);
                    } else {
                        return reject(err);
                    }
                });
            });
        });
    });
}


/**
 * This function will update and insert all new user invoices from Stripe to the database.
 * @param user_object - User Entity
 * @param callback - callback function
 */
Invoice.fetchUserInvoices = function (user_object) {
    return new Promise(function (resolve, reject) {
        //Getting the last inserted invoice
        Invoice.findAllByOrder('user_id', user_object.get('id'), 'date', 'desc', function (all_invoice_result) {
            return resolve(all_invoice_result);
        });
    }).then(function (all_invoices) {
        return new Promise(function (resolve, reject) {
            //Stripe object to retrieve new invoices
            let invoice_obj = {
                customer : user_object.get('customer_id'),
                limit : 100
            };
            if(all_invoices.length > 0){
                invoice_obj.ending_before = all_invoices[0].get('invoice_id');
            }
            //TODO: loop through the stripe response pages
            Stripe().connection.invoices.list(invoice_obj, function(err, invoices) {
                if(!err) {
                    return resolve(invoices);
                } else {
                    return reject(err);
                }
            });
        });
    }).then(function (invoices) {
        return new Promise(function (resolveall, rejectall) {
            Promise.all(invoices.data.map(function (raw_invoice) {
                return Invoice.insertInvoice(raw_invoice, user_object);
            })).then(function () {
                return resolveall('Invoices imported');
            }).catch(function (err) {
                return rejectall(err);
            });
        });
    });
};

Invoice.insertInvoice = function (raw_invoice, user) {
    return new Promise(function(resolve, reject) {
        //Set the service instance id
        if(raw_invoice.subscription) {
            ServiceInstances.findOne('subscription_id', raw_invoice.subscription, function (service) {
                if(service.data) {
                    //Dont import the invoice if its the custom daily invoice with 0 value
                    if(service.data.type != "subscription" && raw_invoice.total == 0 && raw_invoice.lines.data.length == 1) {
                        return reject('Invoice belogs to a non-subscription service and has no value. Not imported!');
                    } else {
                        raw_invoice.service_instance_id = service.data.id;
                        return resolve(raw_invoice);
                    }
                } else {
                    return reject('Invoice does not belong to a ServiceBot service!');
                }
            });
        } else {
            return reject('Invoice does not belong to a ServiceBot service!');
        }
    }).then(function (raw_invoice) {
        //Create the invoice object in the database
        return new Promise(function (resolve, reject) {
            raw_invoice.invoice_id = raw_invoice.id;
            delete raw_invoice.id;
            raw_invoice.user_id = user.data.id;
            let invoice_entity = new Invoice(raw_invoice);
            invoice_entity.create(function (err, created_invoice) {
                if(!err) {
                    created_invoice.data.references = {};
                    return resolve(created_invoice);
                } else {
                    return reject(err);
                }
            });
        });
    }).then(function (invoice) {
        return new Promise(function (resolve, reject) {
            //Add Transaction array
            let transaction_array = [];
            Transactions.fetchCharge(invoice.data.charge, function (err, charge) {
                if(!err){
                    if(charge){
                        transaction_array.push(charge);
                    }
                    invoice.data.references.transactions = transaction_array;
                    return resolve(invoice);
                } else {
                    return reject(err);
                }
            });
        });
    }).then(function (invoice) {
        return new Promise(function (resolve, reject) {
            //Add all lines as reference
            let invoice_line_array = [];
            raw_invoice.lines.data.forEach(invoice_line => {
                invoice_line.line_item_id = invoice_line.id;
                delete invoice_line.id;
                invoice_line_array.push(invoice_line);
            });
            invoice.data.references.user_invoice_lines = invoice_line_array;
            return resolve(invoice);
        })
    }).then(function (invoice) {
        //Insert all line items
        return new Promise(function (resolve, reject) {
            let reference_data = invoice.data.references;
            for (let reference of references){
                if(reference_data[reference.model.table] && reference_data[reference.model.table].length > 0){
                    let referenceData = reference_data[reference.model.table];
                    invoice.createReferences(referenceData, reference, function (modifiedEntity) {
                        //console.log('Invoice references created!');
                    });
                }
            }
            return resolve(invoice);
        });
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