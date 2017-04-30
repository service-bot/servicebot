
let ServiceInstanceProperty = require('../models/service-instance-property');

module.exports = function(router) {

    require("./entity")(router, ServiceInstanceProperty, "service-instance-properties");

    return router;
};