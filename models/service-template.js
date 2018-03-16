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
        if (self.data.detail) {

            //todo : strip out XSS
            service_description = `${service_description} <hr> ${self.data.detail}`;
        }
        //Initialize the new service instance
        let instanceAttributes = {
            name: instanceRequest.name || self.get("name"),
            description: service_description,
            requested_by: instanceRequest.requested_by,
            user_id: instanceRequest.user_id,
            service_id: self.get("id"),
            type: self.get("type"),
            split_configuration : self.get("split_configuration"),
            status : "requested"
        };

        let submittedProperties = instanceRequest.references.service_template_properties;
        let ServiceInstance = require('../models/service-instance');
        let service = new ServiceInstance(await ServiceInstance.createPromise(instanceAttributes));
        let props = await service.generateProps(submittedProperties);
        if (self.data.type === 'one_time') {
            let charge_obj = {
                'user_id': service.get('user_id'),
                'service_instance_id': service.get('id'),
                'currency': self.get('currency'),
                'amount': instanceRequest.amount || self.get('amount') || 0,
                'description': service.get('name')
            };
            let charge = await  Charges.createPromise(charge_obj);
        }
        let plan = (self.data.type === 'one_time' || self.data.type === 'custom' || self.data.type === "split") ? {...self.data, amount : 0, interval : "day"} : instanceRequest;
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

