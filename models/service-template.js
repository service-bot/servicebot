let ServiceTemplateProperty = require("./service-template-property");
let ServiceCategory = require('./service-category');
let User = require('./user');
let File = require("./file");



let references = [
    {"model":ServiceTemplateProperty, "referenceField": "parent_id", "direction":"from", "readOnly":false},
    {"model":ServiceCategory, "referenceField": "category_id", "direction":"to", "readOnly":true},
    {"model":User, "referenceField": "created_by", "direction":"to", "readOnly": true}
];
var ServiceTemplate = require("./base/entity")("service_templates", references);
ServiceTemplate.iconFilePath = "uploads/templates/icons";
ServiceTemplate.imageFilePath = "uploads/templates/images";

ServiceTemplate.prototype.requestPromise = function (uid, body = {}, permission_array = []) {
    let self = this;
    let service_user_id = uid;
    let service_description = self.data.description;
    let service_name = self.data.name;
    //Check if user has request_on_behalf permissions and has requested on behalf of a customer
    if (permission_array.some(p => p.get("permission_name") == "can_administrate" || p.get("permission_name") == "can_manage")) {
        if (body.client_id) {
            service_user_id = body.client_id;
            service_description = body.description;
            service_name = body.name;
        }
    }
    if(self.data.detail) {
        service_description = `${service_description} <hr> ${self.data.detail}`;
    }
    //Idealize the new service instance
    let instanceAttributes = {
        name: service_name,
        description: service_description,
        requested_by: uid,
        user_id: service_user_id,
        service_id: self.get("id"),
        type: self.get("type")
    };
    let submittedProperties = null;
    if(body.references) {
        submittedProperties = body.references.service_template_properties;
    }
    let ServiceInstance = require('./service-instance');
    let newInstance = new ServiceInstance(instanceAttributes);
    return new Promise(function (resolve_all, reject_all) {
        newInstance.create(function (err, service) {
            return new Promise(function (resolve, reject) {
                //Generate Props
                service.generateProps(submittedProperties, function (props) {
                    return resolve(props);
                });
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    //If the user has permissions, then grab the requested payment info
                    //Add the one-time service check
                    if (self.data.type == 'one_time') {
                        let template_plan = self.data;
                        template_plan.amount = 0;
                        template_plan.interval = 'day';
                        service.buildPayStructure(template_plan, function (pay_plan) {
                            return resolve(pay_plan);
                        });
                    } else if (permission_array.some(p => p.get("permission_name") == "can_administrate" || p.get("permission_name") == "can_manage")) {
                        if(body.amount) {
                            service.buildPayStructure(body, function (pay_plan) {
                                return resolve(pay_plan);
                            });
                        } else {
                            return resolve(null);
                        }
                    } else {
                        return resolve(null);
                    }
                });
            }).then(function (pay_plan) {
                return new Promise(function (resolve, reject) {
                    //Create the payment plan
                    service.createPayPlan(pay_plan, function (err, plan) {
                        if(!err) {
                            return resolve(plan);
                        } else {
                            return reject(err);
                        }
                    });
                });
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    //If requested by the user, approve the instance as well
                    if (service_user_id == uid) {
                        service.subscribe(function (err, subscription) {
                            if(!err) {
                                return resolve(service);
                            } else {
                                return reject(err);
                            }
                        });
                    } else {
                        return resolve(service);
                    }
                });
            }).then(function () {
                return resolve_all(service);
            });
        });
    });
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

