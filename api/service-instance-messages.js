
let ServiceInstanceMessage = require('../models/service-instance-message');

module.exports = function(router) {

    require("./entity")(router, ServiceInstanceMessage, "service-instance-messages");
    return router;
};