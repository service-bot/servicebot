
let ServiceTemplateProperty = require('../models/service-template-property');

module.exports = function(router) {

    require("./entity")(router, ServiceTemplateProperty, "service-template-properties");

    return router;
};
