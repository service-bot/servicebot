module.exports = function(router) {
    require("./entity")(router, require("../models/base/entity")("webhooks"), "webhooks");
};