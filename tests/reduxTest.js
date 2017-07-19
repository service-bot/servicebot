require('dotenv').config({path: require("path").join(__dirname, '../env/.env')});

let store = require("../config/redux/store");
let triggerEvent = require("../config/redux/actions").triggerEvent;
let ServiceInstance = require("../models/service-instance");


store.initialize().then((result) => {
    console.log(result);
    console.log("HUH");
    ServiceInstance.findOne("id", 1, function (instance) {
        console.log("found instance " + instance.get("name"));
        store.dispatch(triggerEvent("request_service_instance_admin", instance));
    });
});



