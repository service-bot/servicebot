var knex = require('./db');
var _ = require("lodash");
var Role = require("../models/role");
var Permission = require("../models/permission");
var SystemOption = require("../models/system-options");
let options = require("./system-options");
let DefaultTemplates = require("./default-notifications");
let NotificationTemplate = require("../models/notification-template");
let Notification = require("../models/notifications");
let fs = require("fs");
let request = require("request");
let swaggerJSON = require("../api-docs/api-paths.json");
let User = require("../models/user");
let Stripe = require("./stripe");
let store = require("./redux/store");
let migrate = require("./migrations/migrate");
let setOptions = require("./redux/actions").setOptions;
//DO NOT MODIFY THE CORE SCHEMA!
//If you do, make sure you know exactly what you are doing!

//defining initial roles and
//TODO: Change the initialRoleMap to have actual permissions
let systemOptions = options.options;


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
            store.dispatch(setOptions({
                stripe_secret_key: initConfig.stripe_secret,
                stripe_publishable_key: initConfig.stripe_public
            }))
            Role.findOne("role_name", "admin", (adminRole) => {
                let admin = new User({
                    email: initConfig.admin_user,
                    password: require("bcryptjs").hashSync(initConfig.admin_password, 10),
                    role_id: adminRole.get("id"),
                    name: "admin"
                });


                admin.createWithStripe(function (err, result) {
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

//Creating initial user tables:
module.exports = function (initConfig) {
    return knex("pg_catalog.pg_tables").select("tablename").where("schemaname", "public").then(function (exists) {
        //knex.schema.hasTable('user_card').then(function(exists){
        //If the tables specified dont exist:
        if (exists.length == 0) {
            console.log("User tables don't exist - Creating tables...");
            return knex.schema.createTable('user_roles', function (table) {
                table.increments();
                table.string('role_name').unique();
                table.timestamps(true, true);
                console.log("Created 'user_roles' table.");

            }).createTable('user_permissions', function (table) {
                table.increments();
                table.string('permission_name').unique();
                table.timestamps(true, true);
                console.log("Created 'user_permissions' table.");

            }).createTable('roles_to_permissions', function (table) {
                table.increments();
                table.integer('role_id').references('user_roles.id').onDelete('cascade');
                table.integer('permission_id').references('user_permissions.id').onDelete('cascade');
                table.timestamps(true, true);
                console.log("Created 'roles_to_permissions' table.");

            }).createTable('users', function (table) {
                table.increments();
                table.integer('role_id').references('user_roles.id');
                table.string('name');
                table.string('email').notNullable().unique();
                table.string('password');
                table.enu('status', ['active', 'suspended', 'invited', 'flagged', 'disconnected']).defaultTo('active');
                table.string('customer_id');
                table.string('phone');
                table.timestamp('last_login');
                table.timestamps(true, true);
                console.log("Created 'users' table.");

            }).createTable('funds', function (table) {
                table.increments();
                table.integer('user_id').references('users.id').onDelete('cascade');
                table.boolean('flagged').defaultTo(false);
                table.jsonb('source');
                table.timestamps(true, true);
                console.log("Created 'funds' table.");

            }).createTable('invitations', function (table) {
                table.increments();
                table.string('token');
                table.integer('user_id').references('users.id').onDelete('cascade');
                table.timestamps(true, true);
                console.log("Created 'invitations' table.");

            }).createTable('system_options', function (table) {
                table.string('option').primary();
                table.string('value');
                table.boolean("public").defaultTo(false);
                table.string('type');
                table.string('data_type');
                table.timestamps(true, true);
                console.log("Created 'system_options' table.");

            }).createTable('event_logs', function (table) {
                table.increments();
                table.integer('user_id');
                table.string('log_level');
                table.string('log_type');
                table.string('log');
                table.timestamps(true, true);
                console.log("Created 'event_logs' table.");

            }).createTable('files', function (table) {
                table.increments();
                table.integer('user_id').references('users.id').onDelete('cascade');
                table.string('path');
                table.integer('size');
                table.string('name');
                table.string('mimetype');
                table.timestamps(true, true);
                console.log("Created 'files' table.");

            }).createTable('notification_templates', function (table) {
                table.increments();
                table.string('name');
                table.string('event_name');
                table.text('message', 'longtext');
                table.string('subject');
                table.string('description');
                table.string("model");
                table.specificType('additional_recipients', 'text[]');
                table.boolean("send_email").defaultTo(false);
                table.boolean("send_to_owner").defaultTo(true);
                table.boolean("create_notification").default(true);
                table.timestamps(true, true);
                console.log("Created 'notification_templates' table.");

            }).createTable("notification_templates_to_roles", function (table) {
                table.increments();
                table.integer("notification_template_id").references("notification_templates.id");
                table.integer("role_id").references("user_roles.id");
                table.timestamps(true, true);
                console.log("Created 'notification_templates_to_roles' table.");

            }).createTable('notifications', function (table) {
                table.increments();
                table.string("source_id").unique();
                table.text('message', 'longtext');
                table.string("type");
                table.integer("user_id").references("users.id").onDelete('cascade');
                table.string("subject");
                table.string("affected_versions").defaultTo("*");
                table.boolean("read").defaultTo(false);
                table.boolean("email_delivered").defaultTo(false);
                table.boolean("email_read").defaultTo(false);
                table.timestamp('created_at').defaultTo(knex.fn.now());
                console.log("created notifications table");

            }).createTable('service_categories', function (table) {
                table.increments();
                table.string('name');
                table.string('description');
                table.timestamps(true, true);
                console.log("Created 'service_categories' table.");

            }).createTable('service_templates', function (table) {
                table.increments();
                table.integer('category_id').references('service_categories.id');
                table.integer('created_by').references('users.id');
                table.string('name').notNullable().unique();
                table.string('description');
                table.text('details', 'longtext');
                table.boolean('published').defaultTo(false);
                table.string('statement_descriptor');
                table.integer('trial_period_days');
                table.float('amount');
                table.float('overhead');
                table.string('currency').defaultTo('usd');
                table.string('interval');
                table.integer('interval_count').defaultTo(1);
                table.enu('type', ['subscription', 'one_time', 'custom']).defaultTo('subscription');
                table.boolean('subscription_prorate').defaultTo(true);
                table.timestamps(true, true);
                console.log("Created 'services_templates' table.");

            }).createTable('service_instances', function (table) {
                table.increments();
                table.integer('service_id').references('service_templates.id');
                table.integer('user_id').references('users.id');
                table.integer('requested_by').references('users.id');
                table.jsonb('payment_plan');
                table.string('name');
                table.text('description', 'longtext');
                table.string('subscription_id');
                table.enu('status', ['running', 'requested', 'in_progress', 'waiting_cancellation', 'missing_payment', 'cancelled', 'completed']).defaultTo('missing_payment');
                table.enu('type', ['subscription', 'one_time', 'custom']).defaultTo('subscription');
                table.timestamps(true, true);
                console.log("Created 'service_instances' table.");

            }).createTable('service_instance_messages', function (table) {
                table.increments();
                table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
                table.integer('user_id').references('users.id');
                table.string('message');
                table.timestamps(true, true);
                console.log("Created 'service_instance_messages' table.");

            }).createTable('service_instance_cancellations', function (table) {
                table.increments();
                table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
                table.integer('user_id').references('users.id');
                table.enu('status', ['waiting', 'approved', 'rejected']).defaultTo('waiting');
                table.integer('fulfilled_by').references('users.id');
                table.timestamps(true, true);
                console.log("Created 'service_instance_cancellations' table.");

            }).createTable('properties', function (table) {
                table.increments();
                table.string('name');
                table.string('value');
                table.string('prop_class');
                table.string('prop_label');
                table.string('prop_description');
                table.timestamps(true, true);
                console.log("Created 'properties' table.");

            }).createTable('service_template_properties', function (table) {
                //Inherits the properties table.
                table.inherits('properties');
                table.increments();
                table.integer('parent_id').references('service_templates.id').onDelete('cascade');
                table.boolean('private').defaultTo(false);
                table.boolean('prompt_user').defaultTo(true);
                table.boolean('required').defaultTo(false);
                table.string('prop_input_type');
                table.specificType('prop_values', 'text[]');
                table.timestamps(true, true);
                console.log("Created 'service_template_properties' table.");

            }).createTable('service_instance_properties', function (table) {
                //Inherits the properties table.
                table.inherits('properties');
                table.increments();
                table.integer('parent_id').references('service_instances.id').onDelete('cascade');
                table.boolean('private').defaultTo(false);
                table.timestamps(true, true);
                console.log("Created 'service_instance_properties' table.");

            }).createTable('user_invoices', function (table) {
                table.increments();
                table.integer('user_id').references('users.id');
                table.integer('service_instance_id').references('service_instances.id');
                table.string('invoice_id').unique();
                table.string('subscription');
                table.string('charge');
                table.string('description');
                table.float('amount_due');
                table.float('discount');
                table.integer('attempt_count');
                table.boolean('closed');
                table.string('currency');
                table.boolean('forgiven');
                table.bigInteger('date');
                table.bigInteger('next_attempt');
                table.boolean('paid');
                table.bigInteger('period_end');
                table.bigInteger('period_start');
                table.string('receipt_number');
                table.float('starting_balance');
                table.float('ending_balance');
                table.float('total');
                table.boolean('livemode');
                table.timestamps(true, true);
                console.log("Created 'user_invoices' table.");

            }).createTable('charge_items', function (table) {
                table.increments();
                table.integer('user_id').references('users.id');
                table.integer('service_instance_id').references('service_instances.id').onDelete('cascade');
                table.boolean('approved').defaultTo(false);
                table.string('subscription_id');
                table.string('item_id');
                table.float('amount');
                table.string('currency').defaultTo('usd');
                table.string('description');
                table.bigInteger('period_start');
                table.bigInteger('period_end');
                table.timestamps(true, true);
                console.log("Created 'charge_items' table.");

            }).createTable('user_invoice_lines', function (table) {
                table.increments();
                table.integer('invoice_id').references('user_invoices.id').onDelete('cascade');
                table.string('line_item_id');
                table.float('amount');
                table.string('currency');
                table.string('description');
                table.boolean('proration');
                table.integer('quantity');
                table.string('type');
                table.boolean('livemode');
                table.timestamps(true, true);
                console.log("Created 'user_invoice_lines' table.");

            }).createTable('transactions', function (table) {
                table.increments();
                table.integer('invoice_id').references('user_invoices.id').onDelete('cascade');
                table.integer('user_id').references('users.id');
                table.string('charge_id');
                table.string('invoice');
                table.float('amount');
                table.boolean('refunded');
                table.float('amount_refunded');
                table.jsonb('refunds');
                table.boolean('captured');
                table.string('currency');
                table.string('dispute');
                table.boolean('paid');
                table.string('description');
                table.string('failure_code');
                table.string('failure_message');
                table.string('statement_descriptor');
                table.string('status');
                table.boolean('livemode');
                table.timestamps(true, true);
                console.log("Created 'transactions' table.");

            }).createTable('user_upcoming_invoice', function (table) {
                table.increments();
                table.integer('user_id').references('users.id').onDelete('cascade');
                table.bigInteger('next_payment');
                table.jsonb('invoice_json');
                table.timestamps(true, true);
                console.log("Created 'user_upcoming_invoice' table.");

            }).createTable('password_reset_request', function (table) {
                table.increments();
                table.integer('user_id').references('users.id').onDelete('cascade');
                table.string('hash');
                table.timestamps(true, true);
                console.log("Created 'password_reset_request' table.");
                console.log("***** All Tables successfully created *****");
            });
        }
        return false;

        //initialize permissions and users
    }).then(function (isInit) {
        return new Promise(function (resolve, reject) {
            if (!isInit) {
                //ensure required system-options exist in database
                console.log("database initialized - checking to see if system-options exist")
                options.populateOptions(systemOptions).then((result) => {
                    console.log(result);
                    resolve(false);
                });
            } else {
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
                            public: true,
                            "type": "system",
                            "data_type": "user_role",
                            "value": userRole['id']
                            }
                        );


                        //create options
                        SystemOption.batchCreate(systemOptions, function (optionResult) {

                            let EmailTemplateToRoles = require("../models/base/entity")("notification_templates_to_roles");
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
        }).then(result => migrate()).then(result => store.initialize());
    });
};



