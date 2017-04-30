
let Permissions = require("../models/permission");

module.exports = function(router) {
    require("./entity")(router, Permissions, "permissions");
}
