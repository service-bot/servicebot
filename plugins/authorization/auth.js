let consume = require("pluginbot/effects/consume");
const ADMIN_PERMISSION = "can_administrate";
module.exports = {

    run : function*(config, provide, services){
        let database = yield consume(services.database);
        //todo: move Role and Permissions to be managed by this plugin
        let Role = require("../../models/role.js");
        let authService = {
            /**
             *
             * @param roles - array of role ids
             * @param permissionNames - array of permission names to check
             * @returns {Promise.<boolean>} if the roles passed contain all the permissions return true
             */
            hasPermissions : async function(roles, permissionNames){
                let roleInstances = await Role.find({
                    id : { "in" : roles}
                });

                //todo: write a database query instead of looping like this!
                let permissionSet = new Set();
                for(let roleInstance of roleInstances){
                    let rolePermissions = await roleInstance.getPermissions();
                    if(rolePermissions.some(permission => permission.data.permission_name === ADMIN_PERMISSION)){
                        return true;
                    }
                    rolePermissions.forEach(perm => permissionNames.find(name => perm.data.permission_name === name) && permissionSet.add(perm.data.permission_name))

                }

                return (permissionSet.size === new Set(permissionNames).size);
            }
        };
        yield provide({authService});
    }

}