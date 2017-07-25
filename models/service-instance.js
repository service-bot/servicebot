//big todo: switch functions to return promises instead of callbacks
let File = require("./file");
let async = require('async');
let ServiceTemplates = require("./service-template");
let ServiceTemplateProperties = require("../models/service-template-property");
let ServiceInstanceProperties = require("./service-instance-property");
let ServiceInstanceMessages = require("./service-instance-message");
let ServiceInstanceCharges = require("./charge");
let ServiceInstanceCancellations = require("./service-instance-cancellation");
let Charges = require("./charge");
let dispatchEvent = require("../config/redux/store").dispatchEvent;

let User = require('./user');
let _ = require("lodash");
let references = [
    {"model":ServiceInstanceProperties, "referenceField": "parent_id", "direction":"from", "readOnly": false},
    {"model":ServiceInstanceMessages, "referenceField": "service_instance_id", "direction":"from", "readOnly": false},
    {"model":ServiceInstanceCharges, "referenceField": "service_instance_id", "direction":"from", "readOnly": true},
    {"model":ServiceInstanceCancellations, "referenceField": "service_instance_id", "direction":"from", "readOnly": true},
    {"model":User, "referenceField": "user_id", "direction":"to", "readOnly": true}
];
let ServiceInstance = require("./base/entity")("service_instances", references);
let Stripe = require('../config/stripe');

ServiceInstance.serviceFilePath = "uploads/services/files";

ServiceInstance.prototype.buildPayStructure = function (payment_object, callback){
    let self = this;
    let plan_arr = ['name','amount','currency','interval','interval_count','statement_descriptor', 'trial_period_days'];
    let random_code = Math.random().toString(36).substring(10, 12) + Math.random().toString(36).substring(10, 12);
    let default_plan = {
        'id' : `${payment_object.name.replace(/ +/g, '-')}-ID${self.get("id")}-${random_code}`,
        'currency' : 'usd',
        'interval' : 'month',
        'interval_count' : 1,
        'statement_descriptor' : 'ServiceBot Subscription',
        'trial_period_days' : 0
    };
    let new_plan = _.pick(payment_object ,plan_arr);
    let plan = _.assign(default_plan, new_plan);
    console.log(plan);

    callback(plan);
}

ServiceInstance.prototype.createPayPlan = function (plan=null, callback){
    let self = this;
    async.waterfall([
        function(callback) {
            if(plan == null) {
                //Create the plan object based on template information
                ServiceTemplates.findOne('id', self.data.service_id, function (template) {
                    self.buildPayStructure(template.data, function (plan) {
                        callback(null, plan);
                    });
                });
            } else {
                callback(null, plan);
            }
        },
        function(plan, callback){
            //TODO: Maybe just always create the new plan. This may be troublesome in the future.
            Stripe().connection.plans.retrieve(plan.id, function(err, retrieved_plan){
                //If the plan exists in Stripe already use the existing one
                if(!err){
                    callback(err, retrieved_plan);
                } else {
                    //Create plan in stripe otherwise
                    Stripe().connection.plans.create(plan, function (err, created_plan) {
                        callback(err, created_plan);
                    });
                }
            });
        },
        function (created_plan, callback) {
            self.data.payment_plan = created_plan;
            self.data.status = "requested";
            self.update(function (err, updated_instance) {
                callback(null, updated_instance);
            });
        }
    ], function(err, result) {
        callback(err, result);
    });
}

ServiceInstance.prototype.deletePayPlan = function (callback) {
    let self = this;
    if(self.data.payment_plan.id) {
        //Remove the plan from Stripe
        Stripe().connection.plans.del(self.data.payment_plan.id, function (err, confirmation) {
            if (!err) {
                self.data.payment_plan = null;
                self.data.status = "missing_payment";
                self.update(function (err, updated_instance) {
                    callback(updated_instance);
                });
            } else {
                callback(err);
            }
        });
    } else {
        callback('Service is has no current payment plan!');
    }
}

ServiceInstance.prototype.changePrice = function (newPlan) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.deletePayPlan(function (result) {
            return resolve(result);
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            self.buildPayStructure(newPlan, function (plan_structure) {
                self.createPayPlan(plan_structure, function (err, plan) {
                    if(!err) {
                        return resolve(plan);
                    } else {
                        return reject(err);
                    }
                });
            });
        });
    }).then(function (updated_instance) {
        return new Promise(function (resolve, reject) {
            Stripe().connection.subscriptions.update(self.data.subscription_id, { plan: updated_instance.data.payment_plan.id }, function(err, subscription) {
                    if(!err) {
                        updated_instance.data.status = 'running';
                        updated_instance.update(function (err, instance) {
                            return resolve(instance);
                        });
                    } else {
                        return reject(err);
                    }
                }
            );
        });
    });
};

//todo: have this function return a promise instead of using callbacks.
ServiceInstance.prototype.subscribe = function (callback) {
    let self = this;
    if(!self.data.subscription_id) {
        new Promise(function (resolve, reject) {
            User.findOne('id', self.data.user_id, function (user) {
                if (user.data) {
                    return resolve(user.data.customer_id);
                } else {
                    return reject('ERROR: No User Found!');
                }
            });
        }).then(function (customer_id) {
            return new Promise(function (resolve, reject) {
                let sub_obj = {
                    "customer": customer_id,
                    "plan": self.data.payment_plan.id
                };
                Stripe().connection.subscriptions.create(sub_obj, function (err, subscription) {
                    if(!err) {
                        return resolve(subscription);
                    } else {
                        return reject(err);
                    }
                });
            });
        }).then(function (subscription) {
            return new Promise(function (resolve, reject) {
                self.data.subscription_id = subscription.id;
                self.data.status = "running";
                self.update(function (err, updated_instance) {
                    if(!err) {
                        return resolve(updated_instance);
                    } else {
                        return reject(err);
                    }
                });
            });
        }).then(function (updated_instance) {
            //This section is for the one_time services. There will be a new charge added and paid on the spot.
            return new Promise(function (resolve, reject) {
                ServiceTemplates.findOne('id', self.data.service_id, function (template) {
                    if(template.data.type == 'one_time') {
                        return resolve(template.data);
                    } else {
                        return resolve(false);
                    }
                });
            }).then(function (template) {
                return new Promise(function (resolve, reject) {
                    if(template) {
                        let charge_obj = {
                            'user_id': self.get('user_id'),
                            'service_instance_id': self.get('id'),
                            'subscription_id': self.get('subscription_id'),
                            'currency': self.data.payment_plan.currency,
                            'amount': template.amount,
                            'description': 'Service One-Time Price'
                        };
                        let charge = new Charges(charge_obj);
                        charge.create(function (err, charge_item) {
                            if(!err) {
                                charge_item.approve(function (result) {
                                    return resolve(updated_instance);
                                });
                            } else {
                                return reject(err);
                            }
                        });
                    } else {
                        return resolve(updated_instance);
                    }
                });
            })
        }).then(function (updated_instance) {
            //todo: move this piece out of model layer into route layer
            dispatchEvent("service_instance_subscribed", updated_instance);
            callback(null, updated_instance);
        }).catch(function (err) {
            callback(err, null);
        });
    } else {
        callback('Service is already subscribed!');
    }
}

ServiceInstance.prototype.unsubscribe = function (callback) {
    let self = this;
    if(self.data.subscription_id) {
        //Remove the subscription from Stripe
        Stripe().connection.subscriptions.del(self.data.subscription_id, function (err, confirmation) {
            if (!err) {
                self.data.subscription_id = null;
                self.data.status = "cancelled";
                self.update(function (err, updated_instance) {
                    callback(err, updated_instance);
                });
            } else {
                callback(err, null);
            }
        });
    } else {
        callback(null, 'Service is has no current subscription!');
    }
}


ServiceInstance.prototype.requestCancellation = function (callback) {
    let self = this;
    //Making sure there is only one cancellation request
    let allowed_cancellation_status = ['running','requested', 'waiting'];
    if(allowed_cancellation_status.includes(self.data.status)){
        let cancellationData = {
            "service_instance_id": self.data.id,
            "user_id": self.data.user_id
        };
        let newServiceCancellation = new ServiceInstanceCancellations(cancellationData);
        newServiceCancellation.create(function(err, result){
            //Update the service instance status
            self.data.status = "waiting_cancellation";
            self.update(function (err, updated_instance) {
                callback(result);
            });
        });
    } else {
        callback('Cancellation is not allowed!');
    }
};


ServiceInstance.prototype.generateProps = function (submittedProperties=null, callback) {
    let self = this;
    ServiceTemplates.findOne('id', self.data.service_id, function (serviceTemplate) {
        //Get all service template properties
        serviceTemplate.getRelated(ServiceTemplateProperties, function (resultProperties) {
            let instanceProperties = [];
            let templateProperties = resultProperties.map(entity => entity.data);
            let submittedMap = _.keyBy(submittedProperties, 'id');
            //For every property in the service template
            for (let templateProperty of templateProperties){
                //Update property value to request value if passed. Otherwise, keep template prop
                if(submittedProperties) {
                    if (templateProperty.prompt_user == true) {
                        if (submittedMap.hasOwnProperty(templateProperty.id)) {
                            templateProperty.value = submittedMap[templateProperty.id].value;
                        }
                    }
                }
                delete templateProperty.created;
                delete templateProperty.id;
                templateProperty.parent_id = self.get("id");
                instanceProperties.push(templateProperty);
            }
            //Create all properties for the service instance
            ServiceInstanceProperties.batchCreate(instanceProperties, function (newProps) {
                callback(newProps);
            });
        });
    });
}

ServiceInstance.prototype.getAllAwaitingCharges = function (callback) {
    let self = this;
    ServiceInstanceCharges.findAll('service_instance_id', self.data.id, function(props){
        //Filter the result to only unapproved items.
        callback(props.filter(function(charges) {
            return !charges.data.approved;
        }));
    });
};


//TODO: The post response is null. maybe make it more meaningful.
ServiceInstance.prototype.approveAllCharges = function (callback) {
    let self = this;
    self.getAllAwaitingCharges(function(all_charges){
        callback(all_charges.map(function(charge){
            charge.approve(function (result) {});
        }));
    });
};


ServiceInstance.prototype.deleteFiles = function(callback){

    File.findFile(ServiceInstance.serviceFilePath, this.get("id"), function(files){
        Promise.all(files.map(file => {
            return new Promise(function(resolve, reject){
                file.delete(function(result){
                    resolve(result);
                })
            })
        })).then(function(deleted){
            callback();
        }).catch(function(err){
            console.error(err);
        })
    })

};

module.exports = ServiceInstance;
