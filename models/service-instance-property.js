//let ServiceInstances = require("./service-instance");
let InstanceProperty = require("./base/entity")("service_instance_properties");
let knex = require('../config/db.js');


InstanceProperty.getByTemplateId = function(templateId, callback){
    require("./service-instance").findAll('service_id', templateId, function(instances){
        let instanceIds = instances.map(entity => entity.data.id);
        knex(InstanceProperty.table).whereIn('parent_id', instanceIds)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new InstanceProperty(e));
                callback(entities);
            })
            .catch(function(err){
                console.log(err);
            });
    });


};

module.exports = InstanceProperty;