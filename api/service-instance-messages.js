
let ServiceInstanceMessage = require('../models/service-instance-message');
let ServiceInstance = require("../models/service-instance");
module.exports = function(router) {

    router.post(`/service-instance-messages`, async function(req,res,next){
        let store = require("../config/redux/store");
        //todo:movethiscodeintoaplugin
        let messageManager = store.getState(true).pluginbot.services.messageManager[0];
        let serviceInstance = await ServiceInstance.findOne("id", req.body.service_instance_id);
        let to = serviceInstance.get("user_id") === req.body.user_id ? 0 : serviceInstance.get("user_id");
        let from = req.body.user_id;
        let message = req.body.message;
        let newMessage = await messageManager.send(to, from, req.body.service_instance_id, message);
        res.json(newMessage);
    });

    require("./entity")(router, ServiceInstanceMessage, "service-instance-messages");
    return router;
};