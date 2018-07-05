let consume = require("pluginbot/effects/consume");
const IS_OWNER_PERMISSION = "ownership";
module.exports = function* (router, routeDefinition, authService) {
//todo: add authentication logic somewhere not in app.js


    let needsOwner = function (permission) {
        return (Array.isArray(permission) ? permission.include(IS_OWNER_PERMISSION) : permission === IS_OWNER_PERMISSION)
    }
    let authMiddleware = function (permissions, Resource) {
        return async function (req, res, next) {
            if (!permissions || permissions.length === 0) {
                return next();
            }
            if (req.isAuthenticated()) {
                let roles = [req.user.data.role_id];

                if (req.params.id && permissions.find(needsOwner) && (await Resource.isOwner(req.params.id, req.user.data.id))) {
                    permissions = permissions.reduce((acc, permission) => {
                        let filteredPermission = needsOwner(permission) ? (Array.isArray(permission) && permission.filter(perm => !needsOwner(perm))) : permission;
                        if (filteredPermission) {
                            acc.push(filteredPermission);
                        }
                        return acc;

                    }, []);
                }
                if (await authService.hasPermissions(roles, permissions)) {
                    return next();
                }
            }
            return res.status(403).json({error: "Unauthorized!"});
        }
    };


    while (true) {

        let {ResourceDefinition, endpoint, method, middleware, permissions, description} = yield consume(routeDefinition);
        console.log("Received route definition", endpoint);
        let newRoute = require("express").Router();

        let routePath = ResourceDefinition ? `/${ResourceDefinition.name}${endpoint}` : endpoint;

        newRoute[method.toLowerCase()](routePath, authMiddleware(permissions, ResourceDefinition), ...middleware);
        router.use(newRoute);
    }
};