let User = function(database) {
    const Role = require('../../models/role');
    const Fund = require('../../models/fund');
    const Resource = require("../../models/base/resource");
    const routeOverrides = require("./user-route-overrides")(database);
    const additionalRoutes = require("./user-routes")(database);

    const references = [
        {"model": Role, "referenceField": "role_id", "direction": "to", "readOnly": true},
        {"model": Fund, "referenceField": "user_id", "direction": "from", "readOnly": true}
    ];

    const modelConfig = {
        tableName : "users",
        references,
        extender : require("./user-model")
    };
    const routeConfig = {
        resourceName : "users",
        userCorrelator: "id",
        routeOverrides,
        additionalRoutes
    };

    return new Resource(modelConfig, routeConfig, database);

};
module.exports = User;