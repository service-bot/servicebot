let emitter = require("../../config/emitter")
let ServiceInstanceProperty = require("../../models/service-instance-property");
let ServiceInstance = require("../../models/service-instance");

module.exports = function setup(options, imports, register) {

    emitter.on("subscription", (instance)=>{
        console.log("NEW SUBSCRIPTION!");
        //Set status from active to in progress
        //store IP in custom property on instance object
        //create instance hash and store in custom prop. pass hash to deployAmazon script so instance gets created with specific hash (do this later)
        require("./deployAmazon")(options)

        let prop = {"parent_id" : instance.get("id"), "name" : "instance_ip", "value" : ""}
        console.log(instance);
    });

    emitter.on("instanceRequest", (req) => {
        console.log(req);
        ServiceInstanceProperty.findOne("value", req.ip, function(property){
            let instanceID = property.get("parent_id");
            ServiceInstance.findById(instanceID, function(instance){
                instance.attachReferences(function (updatedInstance) {
                    if(!hasProperty){
                        //todo continue here
                    }
                });
            })
        })
        //find service instance attached to IP
        //if new instance (no instance hash custom property)
            //set instance hash and set status from in progress to active
            //create new instance message saying instance is ready and linking to fqdn
            //create custom property visable to user with fqdn (if you have time)
            //email user with same text that's in message
    })

    register(null, {
        //define services this plugin provides...
    });
};
