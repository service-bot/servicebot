module.exports = function(database, initConfig){


    //todo: move dependencies into plugins
    let options = require("../../config/system-options");
    let systemOptions = options.options;
    let SystemOption = require("../../models/system-options");
    let Permission = require("../../models/permission");
    let NotificationTemplate = require("../../models/notification-template");
    let User = require("../../models/user");
    let swaggerJSON = require("../../api-docs/api-paths.json");
    let Role = require("../../models/role");
    let DefaultTemplates = require("../../config/default-notifications");
    let additionalPermissions = ["can_administrate", "can_manage"];



    let assignPermissionPromise = function (initConfig, permission_objects, initialRoleMap) {
        return function (role) {
            return new Promise(function (resolve, reject) {
                let mapped = initialRoleMap[role.get("role_name")];
                let perms_to_assign = permission_objects.filter(p => mapped.includes(p.get("permission_name")));
                role.assignPermission(perms_to_assign, function (result) {
                    resolve(role);
                });
            })
        }
    };


    let createAdmin = (initConfig) => {
        return new Promise((resolve, reject) => {
            if (initConfig && initConfig.admin_user && initConfig.admin_password) {
                //sets the stripe keys so the createWithStripe function has access to store data that needs to exist...
                let stripeOptions = {
                    stripe_secret_key: initConfig.stripe_secret,
                    stripe_publishable_key: initConfig.stripe_public
                };
                Role.findOne("role_name", "admin", (adminRole) => {
                    let admin = new User({
                        email: initConfig.admin_user,
                        password: require("bcryptjs").hashSync(initConfig.admin_password, 10),
                        role_id: adminRole.get("id"),
                        name: "admin"
                    });

                    admin.createWithStripe(stripeOptions,function (err, result) {
                        if(err){
                            console.error(err);
                            reject(err);
                        }
                        resolve(result)
                    })

                })

            }else{
                reject("no admin defined, can't initialize...");
            }
        })
    }



    return new Promise(function (resolve, reject) {
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

            let roles = Object.keys(initialRoleMap);

            //add additional permissions
            additionalPermissions.forEach(function (element) {
                permissions.push(element);
                initialRoleMap.admin.push(element);
                if (element === 'can_manage') {
                    initialRoleMap.staff.push(element);
                }
            });

            let permission_data = permissions.map(permission => ({"permission_name": permission}));
            let role_data = roles.map(role => ({"role_name": role}));


            if (initConfig.stripe_public && initConfig.stripe_secret) {
                systemOptions.push({
                    "option": "stripe_secret_key",
                    "value": initConfig.stripe_secret,
                    "type": "payment",
                    public: false
                }, {
                    "option": "stripe_publishable_key",
                    "value": initConfig.stripe_public,
                    "type": "payment",
                    public: false
                })
            }


            //create default email templates
            NotificationTemplate.batchCreate(DefaultTemplates.templates, function (emailResult) {

                //create roles
                Role.batchCreate(role_data, function (roles) {
                    //get the User role id for default_user_role
                    let userRole = roles.filter(role => role['role_name'] == 'user')[0];
                    systemOptions.push({
                            "option": "default_user_role",
                            "public": true,
                            "type": "system",
                            "data_type": "user_role",
                            "value": userRole['id']
                        }
                    );


                    //create options
                    SystemOption.batchCreate(systemOptions, function (optionResult) {

                        let EmailTemplateToRoles = require("../../models/base/entity")("notification_templates_to_roles", [], "id", database);
                        EmailTemplateToRoles.batchCreate(DefaultTemplates.templates_to_roles, function (emailToRolesResult) {
                        });

                        //create role objects from results of inserts
                        let role_objects = roles.map(role => new Role(role));

                        //create permissions
                        Permission.batchCreate(permission_data, function (result) {

                            //create permission objects from results of inserts
                            let permission_objects = result.map(permission => new Permission(permission));

                            //assign permissions to roles
                            resolve(Promise.all(role_objects.map(assignPermissionPromise(initConfig, permission_objects, initialRoleMap)))
                                .then(function () {
                                    //Assign all system settings
                                    return new Promise(function (resolve, reject) {
                                        let options = [
                                            {"option": "company_name", "value": initConfig.company_name},
                                            {"option": "company_address", "value": initConfig.company_address},
                                            {"option": "company_phone_number", "value": initConfig.company_phone_number},
                                            {"option": "company_email", "value": initConfig.company_email},
                                            {"option": "hostname", "value": initConfig.hostname}
                                        ];
                                        SystemOption.batchUpdate(options, function (result) {
                                            return resolve(result);
                                        })
                                    });
                                }).then(options => {
                                    return createAdmin(initConfig)
                                })
                            );
                        });
                    });
                });
            });
        }
    )

};