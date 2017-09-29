let ServiceTemplateProperty = require("./service-template-property");
let ServiceCategory = require('./service-category');
let ServiceInstance = require('./service-instance');
let User = require('./user');
let File = require("./file");
let Charges = require("./charge");



let references = [
    {"model":ServiceTemplateProperty, "referenceField": "parent_id", "direction":"from", "readOnly":false},
    {"model":ServiceCategory, "referenceField": "category_id", "direction":"to", "readOnly":true},
    {"model":User, "referenceField": "created_by", "direction":"to", "readOnly": true}
];
var ServiceTemplate = require("./base/entity")("service_templates", references);
ServiceTemplate.iconFilePath = "uploads/templates/icons";
ServiceTemplate.imageFilePath = "uploads/templates/images";

ServiceTemplate.prototype.requestPromise = async function (instanceRequest) {
    try {
        let self = this;
        let service_user_id = "";
        let service_description = self.data.description;
        let service_name = self.data.name;
        console.log("REQIN!");
        if (self.data.detail) {
            service_description = `${service_description} <hr> ${self.data.detail}`;
        }
        //Idealize the new service instance
        let instanceAttributes = {
            name: instanceRequest.name,
            description: service_description,
            requested_by: instanceRequest.requested_by,
            user_id: instanceRequest.user_id,
            service_id: self.get("id"),
            type: self.get("type")
        };
        let submittedProperties = null;
        let ServiceInstance = require('../models/service-instance');
        let service = new ServiceInstance(await ServiceInstance.createPromise(instanceAttributes));
        console.log(service);
        let props = await service.generateProps(submittedProperties);
        let plan = instanceRequest;


        if (self.data.type === 'one_time') {

            let charge_obj = {
                'user_id': service.get('user_id'),
                'service_instance_id': service.get('id'),
                'currency': self.get('currency'),
                'amount': self.get('amount'),
                'description': service.get('name')
            };
            let charge = await  Charges.createPromise(charge_obj);
            let template_plan = self.data;
            template_plan.amount = 0;
            template_plan.interval = 'day';
            plan = template_plan;
        }
        let payStructure = (instanceRequest.amount === 0 || instanceRequest.amount === undefined) ? null : (await service.buildPayStructure(plan));
        let payPlan = await service.createPayPlan(payStructure);


        if (instanceAttributes.requested_by === instanceAttributes.user_id) {
            await service.subscribe();
        }

        return service;
    }catch(e){
        console.error(e);
        throw e;
    }
    // return new Promise(function (resolve_all, reject_all) {
    //     newInstance.create(function (err, service) {
    //         if(err){
    //             return Promise.reject(err);
    //         } else {
    //             return new Promise(function (resolve, reject) {
    //                 //Generate Props
    //                 service.generateProps(submittedProperties, function (props) {
    //                     return resolve(props);
    //                 });
    //             }).then(function () {
    //                 return new Promise(function (resolve, reject) {
    //                     //Add the one-time service check
    //                     if (self.data.type === 'one_time') {
    //                         //Build the initial Charge item
    //                         let charge_obj = {
    //                             'user_id': service.get('user_id'),
    //                             'service_instance_id': service.get('id'),
    //                             'currency': self.get('currency'),
    //                             'amount': self.get('amount'),
    //                             'description': service.get('name')
    //                         };
    //                         let charge = new Charges(charge_obj);
    //                         let template_plan = self.data;
    //                         template_plan.amount = 0;
    //                         template_plan.interval = 'day';
    //                         //Build the payment structure
    //                         service.buildPayStructure(template_plan, function (pay_plan) {
    //                             //Create the initial charge item (which is the one time cost).
    //                             charge.create(function (err, charge_item) {
    //                                 if(!err) {
    //                                     return resolve(pay_plan);
    //                                 } else {
    //                                     return reject(err);
    //                                 }
    //                             });
    //
    //                         });
    //                     //If the user has permissions, then grab the requested payment info
    //                     } else if (permission_array.some(p => p.get("permission_name") === "can_administrate" || p.get("permission_name") === "can_manage")) {
    //                         if(body.amount) {
    //                             service.buildPayStructure(body, function (pay_plan) {
    //                                 return resolve(pay_plan);
    //                             });
    //                         } else {
    //                             return resolve(null);
    //                         }
    //                     } else {
    //                         return resolve(null);
    //                     }
    //                 });
    //             }).then(function (pay_plan) {
    //                 return new Promise(function (resolve, reject) {
    //                     //Create the payment plan
    //                     service.createPayPlan(pay_plan, function (err, plan) {
    //                         if(!err) {
    //                             return resolve(plan);
    //                         } else {
    //                             return reject(err);
    //                         }
    //                     });
    //                 });
    //             }).then(function () {
    //                 return new Promise(function (resolve, reject) {
    //                     //If requested by the user, approve the instance as well
    //                     if (service_user_id === uid) {
    //                         service.subscribe(function (err, subscription) {
    //                             if(!err) {
    //                                 return resolve(service);
    //                             } else {
    //                                 return reject(err);
    //                             }
    //                         });
    //                     } else {
    //                         return resolve(service);
    //                     }
    //                 });
    //             }).then(function () {
    //                 return resolve_all(service);
    //             });
    //         }
    //     });
    // });
};

ServiceTemplate.prototype.deleteFiles = function(callback){
    let self = this;
    Promise.all([ServiceTemplate.iconFilePath, ServiceTemplate.imageFilePath].map(filePath => {
        return new Promise(function(resolveTop,rejectTop){
            File.findFile(filePath, self.get("id"), function(files){
                Promise.all(files.map(file => {
                    return new Promise(function(resolve, reject){
                        file.delete(function(result){
                            resolve(result);
                        })
                    })
                })).then(function(deleted){
                    resolveTop(deleted);
                }).catch(function(err){
                    rejectTop(err);
                })
            })
        })
    })).then(function(result){
        callback()
    }).catch(function(error){
        console.error(error);
    });
};

module.exports = ServiceTemplate;

