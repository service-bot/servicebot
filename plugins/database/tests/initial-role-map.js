let roleMap = {}
let swaggerJSON = require("../../../api-docs/api-paths.json");

let initialRoleMap = {
    "admin": [],
    "staff": [],
    "user": []
};
let permissions = [];
for (let route in swaggerJSON) {
    for (let method in swaggerJSON[route]) {
        if (swaggerJSON[route][method]['x-roles'].includes("admin")) {
            initialRoleMap.admin.push(swaggerJSON[route][method].operationId);
        }
        if (swaggerJSON[route][method]['x-roles'].includes("staff")) {
            initialRoleMap.staff.push(swaggerJSON[route][method].operationId);
        }
        if (swaggerJSON[route][method]['x-roles'].includes("user")) {
            initialRoleMap.user.push(swaggerJSON[route][method].operationId);
        }
        permissions.push(swaggerJSON[route][method].operationId);
    }
}

console.log(JSON.stringify(initialRoleMap));
module.exports = initialRoleMap;