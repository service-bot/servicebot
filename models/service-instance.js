//big todo: switch functions to return promises instead of callbacks
let File = require("./file");
let async = require('async');
let ServiceTemplates = require("./service-template");
let Tier = require("./tier");
let PaymentStructureTemplate = require("./payment-structure-template");
let ServiceTemplateProperties = require("../models/service-template-property");
let ServiceInstanceProperties = require("./service-instance-property");
let ServiceInstanceMessages = require("./service-instance-message");
let ServiceInstanceCharges = require("./charge");
let ServiceInstanceCancellations = require("./service-instance-cancellation");
let Charges = require("./charge");
let store = require("../config/redux/store");
let promisify = require("bluebird").promisify;
let promisifyProxy = require("../lib/promiseProxy");
let User = require('./user');
let _ = require("lodash");
let references = [
    {"model": ServiceTemplates, "referenceField": "service_id", "direction": "to", "readOnly": true},
    {"model": ServiceInstanceProperties, "referenceField": "parent_id", "direction": "from", "readOnly": true},
    {"model": require('./base/entity')("service_instance_seats", []), "referenceField":"service_instance_id", "direction": "from", "readOnly" : true},
    {"model": ServiceInstanceMessages, "referenceField": "service_instance_id", "direction": "from", "readOnly": true},
    {"model": ServiceInstanceCharges, "referenceField": "service_instance_id", "direction": "from", "readOnly": true},
    {
        "model": ServiceInstanceCancellations,
        "referenceField": "service_instance_id",
        "direction": "from",
        "readOnly": true
    },
    {"model": User, "referenceField": "user_id", "direction": "to", "readOnly": true},
    {
        "model": PaymentStructureTemplate,
        "referenceField": "payment_structure_template_id",
        "direction": "to",
        "readOnly": true
    }

];
let ServiceInstance = require("./base/entity")("service_instances", references);
let Stripe = require('../config/stripe');

ServiceInstance.serviceFilePath = "uploads/services/files";

let buildPayStructure = function (payment_object, callback) {
    let self = this;
    let plan_arr = ['name', 'amount', 'currency', 'interval', 'interval_count', 'statement_descriptor', 'trial_period_days'];
    let random_code = Math.random().toString(36).substring(10, 12) + Math.random().toString(36).substring(10, 12);
    let default_plan = {
        'name' : "servicebot-subscription",
        'id': `${(payment_object.name || "sb-subscription").replace(/ +/g, '-')}-ID${self.get("id")}-${random_code}`,
        'currency': 'usd',
        'interval': 'month',
        'interval_count': 1,
        'statement_descriptor': 'Subscription',
        'trial_period_days': 0
    };
    let new_plan = _.pick(payment_object, plan_arr);
    let plan = _.assign(default_plan, new_plan);
    if (plan.amount === null) {
        plan.amount = 0;
    }
    plan.statement_descriptor = (plan.statement_descriptor || "Subscription").substring(0, 22);
    callback(plan);
};


ServiceInstance.prototype.createPayPlan = async function (plan = null) {
    if (plan === null) {
        let paymentStructure = (await PaymentStructureTemplate.find({id: this.data.payment_structure_template_id}))[0];

        // let template = (await ServiceTemplates.find({"id": this.data.service_id}))[0];
        plan = await this.buildPayStructure({...paymentStructure.data, name:this.data.name});
    }
    if (plan.trial_period_days === null) {
        plan.trial_period_days = 0;
    }
    plan.statement_descriptor = plan.statement_descriptor.substring(0, 22);
    try {
        //TODO: Maybe just always create the new plan. This may be troublesome in the future - try catch bad too...
        this.data.payment_plan = await Stripe().connection.plans.retrieve(plan.id);
    } catch (error) {
        try {
            this.data.payment_plan = await Stripe().connection.plans.create(plan);
        } catch (error) {
            this.data.status = "missing_payment";
            await this.update()
            throw error;
        }
    }
    return this.update();
};


ServiceInstance.prototype.deletePayPlan = async function () {
    let self = this;
    if (self.data.payment_plan.id) {
        //Remove the plan from Stripe
        await Stripe().connection.plans.del(self.data.payment_plan.id);
        self.data.payment_plan = null;
        return await self.update()
    } else {
        throw('Service is has no current payment plan!');
    }
};


ServiceInstance.prototype.subscribe = async function (paymentPlan = null) {
    let self = this;
    if (self.data.subscription_id) {
        throw "Instance is already subscribed"
    }
    let user = (await User.find({"id": self.data.user_id}))[0];
    if (user && user.data.status === "suspended") {
        throw "User is suspended, unable to subscribe"
    }

    if (paymentPlan) {
        self = await this.changePaymentPlan(paymentPlan);
    }
    let sub_obj = {
        "customer": user.data.customer_id,
        "plan": self.data.payment_plan.id
    };

    let subscription = await Stripe().connection.subscriptions.create(sub_obj);
    self.data.subscription_id = subscription.id;
    self.data.status = "running";
    self.data.subscribed_at = subscription.created;
    self.data.trial_end = subscription.trial_end;
    let instanceUpdate = await self.update();
    store.dispatchEvent("service_instance_subscribed", instanceUpdate);
    let charges = await Charges.find({service_instance_id: self.data.id});
    for (let charge of charges) {
        await charge.approve();
    }
    return instanceUpdate;

}

let requestCancellation = function (callback) {
    let self = this;
    let approve_cancellation = store.getState().options.auto_approve_cancellations
    //Making sure there is only one cancellation request
    let allowed_cancellation_status = ['running', 'requested', 'waiting', 'in_progress'];
    if (allowed_cancellation_status.includes(self.data.status)) {
        let cancellationData = {
            "service_instance_id": self.data.id,
            "user_id": self.data.user_id
        };
        if (approve_cancellation) {
            cancellationData.status = "approved"
        }
        let newServiceCancellation = new ServiceInstanceCancellations(cancellationData);
        newServiceCancellation.create(async function (err, result) {
            //Update the service instance status
            if (approve_cancellation) {
                let unsub = await self.unsubscribe()
                callback(result);
            } else {
                self.data.status = "waiting_cancellation";
                self.update(function (err, updated_instance) {
                    callback(result);
                });
            }
        });
    } else {
        callback('Cancellation is not allowed!');
    }
};

let generateProps = function (submittedProperties = null, callback) {
    let self = this;
    ServiceTemplates.findOne('id', self.data.service_id, function (serviceTemplate) {
        //Get all service template properties
        serviceTemplate.getRelated(ServiceTemplateProperties, function (resultProperties) {
            let instanceProperties = [];
            let templateProperties = resultProperties.map(entity => entity.data);
            let submittedMap = _.keyBy(submittedProperties, 'id');
            //For every property in the service template
            for (let templateProperty of templateProperties) {
                //Update property value to request value if passed. Otherwise, keep template prop
                if (submittedProperties) {
                    if (templateProperty.prompt_user === true) {
                        if (submittedMap.hasOwnProperty(templateProperty.id)) {
                            templateProperty.data = submittedMap[templateProperty.id].data;
                            // templateProperty.config = submittedMap[templateProperty.id].config
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
};

let getAllAwaitingCharges = function (callback) {
    let self = this;
    ServiceInstanceCharges.findAll('service_instance_id', self.data.id, function (props) {
        //Filter the result to only unapproved items.
        callback(props.filter(function (charges) {
            return !charges.data.approved;
        }));
    });
};


//TODO: The post response is null. maybe make it more meaningful.
let approveAllCharges = function (callback) {
    let self = this;
    self.getAllAwaitingCharges(function (all_charges) {
        callback(all_charges.map(function (charge) {
            charge.approve(function (err, result) {
            });
        }));
    });
};

let deleteFiles = function (callback) {

    File.findFile(ServiceInstance.serviceFilePath, this.get("id"), function (files) {
        Promise.all(files.map(file => {
            return new Promise(function (resolve, reject) {
                file.delete(function (result) {
                    resolve(result);
                })
            })
        })).then(function (deleted) {
            callback();
        }).catch(function (err) {
            console.error(err);
        })
    })

};

ServiceInstance.prototype.changeProperties = async function (properties) {
    let updatedInstance = await this.attachReferences();
    let oldInstance = {data: {...updatedInstance.data}};
    //todo: support creating new properties, shouldn't be bad... just need to validate the config
    if (properties.some(prop => prop.id === null || prop.parent_id !== updatedInstance.get("id"))) {
        throw "prop id bad or parent id does not match"
    }
    let oldProperties = updatedInstance.data.references.service_instance_properties;
    let lifecycleManager = store.getState(true).pluginbot.services.lifecycleManager;
    if (lifecycleManager) {
        lifecycleManager = lifecycleManager[0];
        await lifecycleManager.prePropertyChange({
            instance: updatedInstance,
            property_updates: properties
        });
    }
    let paymentStructure = (await PaymentStructureTemplate.find({id : updatedInstance.data.payment_structure_template_id}, true))[0];

    let metricIndexToUnprice = null;
    let mergedProps = oldProperties.map((prop, index) => {
        let propToMerge = properties.find(reqProp => reqProp.id === prop.id);
        let finalProp = propToMerge ? {...prop, "data": propToMerge.data} : prop
        if(finalProp.type === "metric"){
            if(!finalProp.config.pricing.tiers.includes(paymentStructure.data.references.tiers[0].name)) {
                metricIndexToUnprice = index
            }
        }
        return finalProp;
    });
    if (this.get("type") === "subscription") {
        let paymentPlan = this.get("payment_plan");
        if (paymentPlan === null || paymentPlan.amount === null) {
            throw "Payment plan not configured properly"
        } else {
            let handlers = (store.getState(true).pluginbot.services.inputHandler || []).reduce((acc, handler) => {
                acc[handler.name] = handler.handler;
                return acc;
            }, {});
            let baseProps = [...oldProperties];
            let newProps = [...mergedProps];
            if(metricIndexToUnprice !== null){
                baseProps.splice(metricIndexToUnprice, 1);
                newProps.splice(metricIndexToUnprice, 1);
            }

            let basePrice = require("../lib/handleInputs").getBasePrice(baseProps, handlers, paymentPlan.amount);
            if(basePrice === 0){
                basePrice = this.data.references.payment_structure_templates[0].amount;
            }
            let newPrice = require("../lib/handleInputs").getPrice(newProps, handlers, basePrice);
            paymentPlan.amount = newPrice;
            updatedInstance = await this.changePaymentPlan(paymentPlan, true);
        }
    }
    let updatedProps = await ServiceInstanceProperties.batchUpdate(mergedProps);
    if (lifecycleManager) {
        await updatedInstance.attachReferences();
        await lifecycleManager.postPropertyChange({
            old_instance: oldInstance,
            instance: updatedInstance,
        });
    }

    return updatedInstance;
};

ServiceInstance.prototype.applyPaymentStructure = async function (paymentStructureId, ignoreTrial) {
    let instance_object = await this.attachReferences();
    let {payment_plan, references : {service_instance_properties, payment_structure_templates}} = instance_object.data;
    let currentStructure = payment_structure_templates[0];
    let handlers = (store.getState(true).pluginbot.services.inputHandler || []).reduce((acc, handler) => {
        acc[handler.name] = handler.handler;
        return acc;
    }, {});

    if (!currentStructure) {
        throw "Instance has no payment structure";
    }

    let paymentStructureTemplate = (await PaymentStructureTemplate.find({id: paymentStructureId}))[0];
    if (!paymentStructureTemplate) {
        throw "Payment Structure Not Found";

    }

    let tier = (await Tier.find({
        service_template_id: instance_object.data.service_id,
        id: paymentStructureTemplate.data.tier_id
    }))[0];
    if (!tier) {
        throw "Incompatible Payment Structure";
    }

    let lifecycleManager = store.getState(true).pluginbot.services.lifecycleManager;
    if (lifecycleManager) {
        lifecycleManager = lifecycleManager[0];
        await lifecycleManager.prePaymentStructureChange({
            instance: instance_object,
            payment_structure_template: paymentStructureTemplate,
        });
    }
    let applicableProperties = service_instance_properties.filter(property => {
        if(property.config && property.config.pricing && property.config.pricing.tiers){
            return property.config.pricing.tiers.includes(tier.data.name);
        }else{
            return true;
        }
    });
    let newPrice = require("../lib/handleInputs").getPrice(applicableProperties, handlers, paymentStructureTemplate.data.amount);

    let paymentPlan = {
        ...paymentStructureTemplate.data,
        name : tier.data.name + "-" + paymentStructureTemplate.data.id,
        amount : newPrice
    };


    let newInstance = await (await instance_object.changePaymentPlan(paymentPlan, ignoreTrial)).attachReferences();
    newInstance.data.payment_structure_template_id = paymentStructureId;
    await newInstance.update();

    if (lifecycleManager) {
        let response = await lifecycleManager.postPaymentStructureChange({
            old_instance: instance_object,
            instance: newInstance
        });
        if (response) {
            newInstance.data = {
                ...newInstance.data,
                ...response
            }
        }
    }
    return newInstance;


};

ServiceInstance.prototype.changePaymentPlan = async function (newPlan, ignorePlanTrial, disableProration) {
    await this.deletePayPlan();
    let planStructure = await this.buildPayStructure(newPlan);
    let updatedInstance = await this.createPayPlan(planStructure);
    if (this.data.subscription_id !== null) {
        let payload = {plan: updatedInstance.data.payment_plan.id};
        if (ignorePlanTrial || newPlan.trial_period_days == null) {
            payload.trial_from_plan = false;
        }
        if(disableProration){
            payload.prorate = false;
        }
        let stripeSubscription = await Stripe().connection.subscriptions.update(this.data.subscription_id, payload);
        let oldTrial = updatedInstance.data.trial_end;
        updatedInstance.data.trial_end = stripeSubscription.trial_end;
        // if (newPlan.id) {
        //     updatedInstance.data.payment_structure_template_id = newPlan.id
        // }
        if (oldTrial !== stripeSubscription.trial_end) {
            updatedInstance = await updatedInstance.update()
            //todo: handle this better,  don't like dispatching here.
            store.dispatchEvent("service_instance_trial_change", updatedInstance);
        }

    }
    // updatedInstance.data.type = updatedInstance.data.payment_plan.amount > 0 ? "subscription" : "custom";
    return updatedInstance;
};

ServiceInstance.prototype.unsubscribe = async function () {
    try {
        let lifecycleManager = store.getState(true).pluginbot.services.lifecycleManager;
        if (lifecycleManager) {
            lifecycleManager = lifecycleManager[0];
            await lifecycleManager.preDecommission({
                instance: this
            });
        }
        if (this.data.subscription_id) {
            //Remove the subscription from Stripe
            await Stripe().connection.subscriptions.del(this.data.subscription_id);
        }
        this.data.subscription_id = null;
        this.data.status = "cancelled";
        let results = await this.update()
        results = await results.attachReferences();
        if (lifecycleManager) {
            lifecycleManager.postDecommission({
                instance: results,
            }).catch(e => {
                console.error(e);
            });
        }
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


//todo: clean this up so they really support promises.
ServiceInstance.prototype.buildPayStructure = promisifyProxy(buildPayStructure);
ServiceInstance.prototype.requestCancellation = promisifyProxy(requestCancellation);
ServiceInstance.prototype.generateProps = promisifyProxy(generateProps);
ServiceInstance.prototype.getAllAwaitingCharges = promisifyProxy(getAllAwaitingCharges);
ServiceInstance.prototype.approveAllCharges = promisifyProxy(approveAllCharges);
ServiceInstance.prototype.deleteFiles = promisifyProxy(deleteFiles);


module.exports = ServiceInstance;
