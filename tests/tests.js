
var test = require('tape');
var string = ''
let stream = test.createStream();
stream.on('data',function(buffer){
    var part = buffer.toString();
    string += part;
});



stream.on('end',function(){
    console.log('final output ' + string);
});

var request = require('supertest');
request = request('http://localhost:3001');
let _ = require("lodash");
let enableDestroy = require('server-destroy');
let initConfig = {stripe_public: "pk_test_Ax20edZBpZW9YEpHeZoQqaKA", stripe_secret:"sk_test_43eiOmKqQMwG3zjZp1PPERiH"}
require('dotenv').config({path: require("path").join(__dirname, '../env/.env')});
let log = console.log;

var config = {
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    port: process.env.POSTGRES_DB_PORT,
    multipleStatements: true

};


var knex = require('knex')({
    client: 'pg',
    connection: config
});

let fs = require("fs");
let Promise = require("bluebird");

const before = test;

let token = null;
let baseHeaders = null;
let app = null;
let server = null;

let reset = function(callback){
    if(app && server) {
        server.destroy();
    }
    //todo: don't do this.. but the pool b draining
        setTimeout(function(){
            require("../config/db").destroy().then(function(res){
                console.log("POOL!", res);
                Object.keys(require.cache).forEach(function(key) { delete require.cache[key] });
                knex.raw('DROP DATABASE IF EXISTS testing')
                    .then(() => knex.raw('CREATE DATABASE testing'))
                    .then(() => require("../app")(initConfig))
                    .then(function(newApp){
                        server = newApp.listen("3001");
                        enableDestroy(server);
                        app = newApp;
                        callback(true);
                }).catch(function(reason){
                    console.err(reason);
                })
            })
        }, 500)

}
let stripDates = function(body){
    let newObj = body;
    for(var i in body){
        if(i == "updated_at" || i == "created_at"){
            delete newObj[i];
        }
        else if( newObj[i] === Object(newObj[i])){
            newObj[i] = stripDates(newObj[i]);
        }
    }

    return newObj;
}
let responseHandler = function(assert, expected, test, callback){
    return function(err, res){
        if(err || (!res || !res.body)) {
            assert.error(err, "error")
            callback(err, res);
        }else{
            let body = stripDates(res.body);
            let strippedExpected = stripDates(expected);
            assert.same(body, strippedExpected, test);
            callback(null, res);
        }

    }




}
before('before', function (assert) {
    reset(function (status) {
        console.log(status);
        request.post("/api/v1/auth/token")
            .send({"email": "admin", "password": "1234"})
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                assert.error(err, "token request made")
                token = res.body.token;
                baseHeaders = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "JWT " + token
                };
                assert.end();

            })
    })

});





test('GET /api/v1/users', function (assert) {
    let sampleUsers = [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, references: { funds: [], user_roles: [ { id: 1, role_name: 'admin' } ] }, role_id: 1, status: 'active' }, { customer_id: null, email: 'user', id: 2, last_login: null, name: null, phone: null, references: { funds: [], user_roles: [ { id: 3, role_name: 'user' } ] }, role_id: 3, status: 'active' }, { customer_id: null, email: 'staff', id: 3, last_login: null, name: null, phone: null, references: { funds: [], user_roles: [ { id: 2, role_name: 'staff' } ] }, role_id: 2, status: 'active' } ];
    request.get('/api/v1/users')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleUsers, "Retrieve list of roles", function(err, res){
            assert.end();
        }))
});



test('GET all roles - /api/v1/roles', function (assert) {

    let sampleRoles = [ { id: 1, role_name: 'admin' }, { id: 2, role_name: 'staff' }, { id: 3, role_name: 'user' } ];

    request.get('/api/v1/roles')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleRoles, "Retrieve list of roles", function(err, res){
            assert.end();
        }))
});


test('GET Specific role -  /api/v1/roles/1', function (assert) {

    let sampleRoles = { id: 1, role_name: 'admin' };

    request.get('/api/v1/roles/1')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleRoles, "Retrieve specific role", function(err, res){
            assert.end();
        }))
});



test('GET all permissions -  /api/v1/permissions', function (assert) {

    let sampleRoles = [ { id: 1, permission_name: 'get_users' }, { id: 2, permission_name: 'get_users_search' }, { id: 3, permission_name: 'get_users_id' }, { id: 4, permission_name: 'put_users_id' }, { id: 5, permission_name: 'delete_users_id' }, { id: 6, permission_name: 'get_users_id_avatar' }, { id: 7, permission_name: 'put_users_id_avatar' }, { id: 8, permission_name: 'post_users_register' }, { id: 9, permission_name: 'post_users_invite' }, { id: 10, permission_name: 'get_roles' }, { id: 11, permission_name: 'post_roles' }, { id: 12, permission_name: 'get_roles_search' }, { id: 13, permission_name: 'get_roles_id' }, { id: 14, permission_name: 'put_roles_id' }, { id: 15, permission_name: 'delete_roles_id' }, { id: 16, permission_name: 'get_roles_manage_permissions' }, { id: 17, permission_name: 'post_roles_manage_permissions' }, { id: 18, permission_name: 'get_service_templates' }, { id: 19, permission_name: 'post_service_templates' }, { id: 20, permission_name: 'get_service_templates_search' }, { id: 21, permission_name: 'get_service_templates_id' }, { id: 22, permission_name: 'put_service_templates_id' }, { id: 23, permission_name: 'delete_service_templates_id' }, { id: 24, permission_name: 'get_service_templates_id_icon' }, { id: 25, permission_name: 'put_service_templates_id_icon' }, { id: 26, permission_name: 'get_service_templates_id_image' }, { id: 27, permission_name: 'put_service_templates_id_image' }, { id: 28, permission_name: 'get_service_templates_id_request' }, { id: 29, permission_name: 'put_service_templates_id_request' }, { id: 30, permission_name: 'get_service_categories' }, { id: 31, permission_name: 'post_service_categories' }, { id: 32, permission_name: 'get_service_categories_search' }, { id: 33, permission_name: 'get_service_categories_id' }, { id: 34, permission_name: 'put_service_categories_id' }, { id: 35, permission_name: 'delete_service_categories_id' }, { id: 36, permission_name: 'get_service_template_properties' }, { id: 37, permission_name: 'post_service_template_properties' }, { id: 38, permission_name: 'get_service_template_properties_search' }, { id: 39, permission_name: 'get_service_template_properties_id' }, { id: 40, permission_name: 'put_service_template_properties_id' }, { id: 41, permission_name: 'delete_service_template_properties_id' }, { id: 42, permission_name: 'get_service_instances' }, { id: 43, permission_name: 'get_service_instances_own' }, { id: 44, permission_name: 'get_service_instances_search' }, { id: 45, permission_name: 'get_service_instances_id' }, { id: 46, permission_name: 'put_service_instances_id' }, { id: 47, permission_name: 'delete_service_instances_id' }, { id: 48, permission_name: 'post_service_instances_id_approve' }, { id: 49, permission_name: 'post_service_instances_id_change_price' }, { id: 50, permission_name: 'post_service_instances_id_cancel' }, { id: 51, permission_name: 'post_service_instances_id_request_cancellation' }, { id: 52, permission_name: 'post_service_instances_id_add_charge' }, { id: 53, permission_name: 'get_service_instances_id_awaiting_charges' }, { id: 54, permission_name: 'post_service_instances_id_approve_charges' }, { id: 55, permission_name: 'post_service_instances_id_files' }, { id: 56, permission_name: 'get_service_instances_id_files' }, { id: 57, permission_name: 'delete_service_instances_id_files_fid' }, { id: 58, permission_name: 'get_service_instances_id_files_fid' }, { id: 59, permission_name: 'get_service_instance_properties' }, { id: 60, permission_name: 'post_service_instance_properties' }, { id: 61, permission_name: 'get_service_instance_properties_search' }, { id: 62, permission_name: 'get_service_instance_properties_id' }, { id: 63, permission_name: 'put_service_instance_properties_id' }, { id: 64, permission_name: 'delete_service_instance_properties_id' }, { id: 65, permission_name: 'get_service_instance_messages' }, { id: 66, permission_name: 'post_service_instance_messages' }, { id: 67, permission_name: 'get_service_instance_messages_search' }, { id: 68, permission_name: 'get_service_instance_messages_id' }, { id: 69, permission_name: 'put_service_instance_messages_id' }, { id: 70, permission_name: 'delete_service_instance_messages_id' }, { id: 71, permission_name: 'get_service_instance_cancellations' }, { id: 72, permission_name: 'post_service_instance_cancellations' }, { id: 73, permission_name: 'get_service_instance_cancellations_own' }, { id: 74, permission_name: 'get_service_instance_cancellations_search' }, { id: 75, permission_name: 'get_service_instance_cancellations_id' }, { id: 76, permission_name: 'put_service_instance_cancellations_id' }, { id: 77, permission_name: 'delete_service_instance_cancellations_id' }, { id: 78, permission_name: 'post_service_instance_cancellations_id_approve' }, { id: 79, permission_name: 'post_service_instance_cancellations_id_reject' }, { id: 80, permission_name: 'get_event_logs' }, { id: 81, permission_name: 'post_event_logs' }, { id: 82, permission_name: 'get_event_logs_search' }, { id: 83, permission_name: 'get_event_logs_id' }, { id: 84, permission_name: 'put_event_logs_id' }, { id: 85, permission_name: 'delete_event_logs_id' }, { id: 86, permission_name: 'get_email_templates' }, { id: 87, permission_name: 'post_email_templates' }, { id: 88, permission_name: 'get_email_templates_search' }, { id: 89, permission_name: 'get_email_templates_id' }, { id: 90, permission_name: 'put_email_templates_id' }, { id: 91, permission_name: 'delete_email_templates_id' }, { id: 92, permission_name: 'get_email_templates_id_roles' }, { id: 93, permission_name: 'put_email_templates_id_roles' }, { id: 94, permission_name: 'get_invoices' }, { id: 95, permission_name: 'get_invoices_own' }, { id: 96, permission_name: 'get_invoices_search' }, { id: 97, permission_name: 'get_invoices_id' }, { id: 98, permission_name: 'get_invoices_upcoming_userid' }, { id: 99, permission_name: 'post_invoices_id_refund' }, { id: 100, permission_name: 'get_system_options' }, { id: 101, permission_name: 'put_system_options' }, { id: 102, permission_name: 'get_system_options_id' }, { id: 103, permission_name: 'put_system_options_id' }, { id: 104, permission_name: 'get_system_options_file_id' }, { id: 105, permission_name: 'put_system_options_file_id' }, { id: 106, permission_name: 'post_charge_id_approve' }, { id: 107, permission_name: 'post_charge_id_cancel' }, { id: 108, permission_name: 'post_auth_token' }, { id: 109, permission_name: 'post_auth_session_clear' }, { id: 110, permission_name: 'post_auth_reset_password' }, { id: 111, permission_name: 'get_auth_reset_password_uid_token' }, { id: 112, permission_name: 'post_auth_reset_password_uid_token' }, { id: 113, permission_name: 'get_analytics_data' }, { id: 114, permission_name: 'get_analytics_properties_id' }, { id: 115, permission_name: 'get_permissions' }, { id: 116, permission_name: 'can_administrate' }, { id: 117, permission_name: 'can_manage' } ]

    request.get('/api/v1/permissions')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleRoles, "Retrieve list of Permissions", function(err, res){
            assert.end();
        }))
});



test('GET Analytics', function (assert) {


    request.get('/api/v1/analytics/data')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res){
            assert.end();
        })
});


test('GET /api/v1/service-instance-properties', function (assert) {

    let sampleData = [ { id: 1, name: 'service_instance_property_1', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 1', prop_label: 'What is instance property 1?', value: 'you decide' }, { id: 2, name: 'service_instance_property_2', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 2', prop_label: 'What is instance property 2?', value: 'you decide' }, { id: 3, name: 'service_instance_property_3', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 3', prop_label: 'What is instance property 3?', value: 'you decide' }, { id: 4, name: 'service_instance_property_4', parent_id: 2, prop_class: null, prop_description: 'demo service instance property 4', prop_label: 'What is instance property 4?', value: 'you decide' } ];

    request.get('/api/v1/service-instance-properties')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleData, "Retrieve list of instance properties", function(err, res){
            assert.end();
        }))
});

test('GET /api/v1/service-template-properties', function (assert) {

    let sampleData =  [ { id: 1, name: 'service_template_property_1', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decide' }, { id: 2, name: 'service_template_property_2', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 2', prop_input_type: 'text', prop_label: 'What is template property 2?', prop_values: null, required: true, value: 'you decide' }, { id: 3, name: 'service_template_property_3', parent_id: 1, private: true, prompt_user: false, prop_class: null, prop_description: 'demo service template property 3', prop_input_type: 'text', prop_label: 'What is template property 3?', prop_values: null, required: false, value: 'you decide' }, { id: 4, name: 'service_template_property_4', parent_id: 2, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 4', prop_input_type: 'text', prop_label: 'What is template property 4?', prop_values: null, required: true, value: 'you decide' } ];

    request.get('/api/v1/service-template-properties')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleData, "Retrieve list of template properties", function(err, res){
            assert.end();
        }))
});


test('GET /api/v1/service-templates', function (assert) {

    let data = [ { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 1', details: 'nitty gritty', id: 1, interval: null, interval_count: 1, name: 'service_1', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 1, name: 'service_template_property_1', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decide' }, { id: 2, name: 'service_template_property_2', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 2', prop_input_type: 'text', prop_label: 'What is template property 2?', prop_values: null, required: true, value: 'you decide' }, { id: 3, name: 'service_template_property_3', parent_id: 1, private: true, prompt_user: false, prop_class: null, prop_description: 'demo service template property 3', prop_input_type: 'text', prop_label: 'What is template property 3?', prop_values: null, required: false, value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 2, currency: 'usd', description: 'demo service 2', details: 'such description', id: 2, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 4, name: 'service_template_property_4', parent_id: 2, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 4', prop_input_type: 'text', prop_label: 'What is template property 4?', prop_values: null, required: true, value: 'you decide' } ], users: [ { customer_id: null, email: 'user', id: 2, last_login: null, name: null, phone: null, role_id: 3, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 3, currency: 'usd', description: 'demo service 3', details: null, id: 3, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'staff', id: 3, last_login: null, name: null, phone: null, role_id: 2, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 4', details: null, id: 4, interval: null, interval_count: 1, name: 'service_3', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null } ];

    request.get('/api/v1/service-templates')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of templates", function(err, res){
            assert.end();
        }))
});


test('GET /api/v1/service-instances', function (assert) {

    let data = [ { description: 'demo service instance 1', id: 1, name: 'service_instance_1', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [ { id: 1, name: 'service_instance_property_1', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 1', prop_label: 'What is instance property 1?', value: 'you decide' }, { id: 2, name: 'service_instance_property_2', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 2', prop_label: 'What is instance property 2?', value: 'you decide' }, { id: 3, name: 'service_instance_property_3', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 3', prop_label: 'What is instance property 3?', value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 1, status: 'requested', subscription_id: null, user_id: 1 }, { description: 'demo service instance 2', id: 2, name: 'service_instance_2', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [ { id: 4, name: 'service_instance_property_4', parent_id: 2, prop_class: null, prop_description: 'demo service instance property 4', prop_label: 'What is instance property 4?', value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 2, status: 'requested', subscription_id: null, user_id: 1 }, { description: 'demo service instance 2', id: 3, name: 'service_instance_2', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 3, status: 'requested', subscription_id: null, user_id: 1 } ];

    request.get('/api/v1/service-instances')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of instances", function(err, res){
            assert.end();
        }))
});
test('GET /api/v1/service-instance-messages', function (assert) {

    let data = [ { description: 'demo service instance 1', id: 1, name: 'service_instance_1', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [ { id: 1, name: 'service_instance_property_1', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 1', prop_label: 'What is instance property 1?', value: 'you decide' }, { id: 2, name: 'service_instance_property_2', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 2', prop_label: 'What is instance property 2?', value: 'you decide' }, { id: 3, name: 'service_instance_property_3', parent_id: 1, prop_class: null, prop_description: 'demo service instance property 3', prop_label: 'What is instance property 3?', value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 1, status: 'requested', subscription_id: null, user_id: 1 }, { description: 'demo service instance 2', id: 2, name: 'service_instance_2', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [ { id: 4, name: 'service_instance_property_4', parent_id: 2, prop_class: null, prop_description: 'demo service instance property 4', prop_label: 'What is instance property 4?', value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 2, status: 'requested', subscription_id: null, user_id: 1 }, { description: 'demo service instance 2', id: 3, name: 'service_instance_2', payment_plan: null, references: { charge_items: [], service_instance_messages: [], service_instance_properties: [], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, requested_by: 1, service_id: 3, status: 'requested', subscription_id: null, user_id: 1 } ];

    request.get('/api/v1/service-instance-messages')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of messages", function(err, res){
            assert.end();
        }))
});


test('GET /api/v1/roles/manage-permissions', function (assert) {

    let sampleData = [ { permission_ids: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117 ], role_id: 1 }, { permission_ids: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 86, 87, 88, 89, 90, 91, 94, 95, 96, 97, 98, 99, 106, 107, 108, 109, 110, 111, 112, 113, 114 ], role_id: 2 }, { permission_ids: [ 3, 4, 6, 7, 8, 24, 26, 28, 29, 43, 45, 46, 48, 51, 53, 54, 55, 56, 57, 58, 65, 66, 67, 68, 69, 73, 77, 95, 97, 98, 108, 109, 110, 111, 112 ], role_id: 3 } ]



    request.get('/api/v1/roles/manage-permissions')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, sampleData, "Retrieve map of roles to permissions", function(err, res){
            assert.end();
        }))
});


test('GET /api/v1/email-templates', function (assert) {

    let sampleRoles = [ { id: 1, role_name: 'admin' }, { id: 2, role_name: 'staff' }, { id: 3, role_name: 'user' } ];

    request.get('/api/v1/email-templates')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res){
            assert.end();
        })
});



test('GET /api/v1/system-options', function (assert) {

    let data = [ { option: 'background_color', value: '#30468a' }, { option: 'action_button_color', value: '#30468a' }, { option: 'cancel_button_color', value: '#30468a' }, { option: 'primary_button_color', value: '#30468a' }, { option: 'info_button_color', value: '#30468a' }, { option: 'page_link_color', value: '#30468a' }, { option: 'header_text_color', value: '#30468a' }, { option: 'text_size', value: '12' }, { option: 'stripe_secret_key', value: 'sk_test_43eiOmKqQMwG3zjZp1PPERiH' }, { option: 'stripe_publishable_key', value: 'pk_test_Ax20edZBpZW9YEpHeZoQqaKA' } ];

    request.get('/api/v1/system-options')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of options", function(err, res){
            assert.end();
        }))
});



test('GET /api/v1/invoices', function (assert) {

    let data = [ { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 1', details: 'nitty gritty', id: 1, interval: null, interval_count: 1, name: 'service_1', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 1, name: 'service_template_property_1', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decide' }, { id: 2, name: 'service_template_property_2', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 2', prop_input_type: 'text', prop_label: 'What is template property 2?', prop_values: null, required: true, value: 'you decide' }, { id: 3, name: 'service_template_property_3', parent_id: 1, private: true, prompt_user: false, prop_class: null, prop_description: 'demo service template property 3', prop_input_type: 'text', prop_label: 'What is template property 3?', prop_values: null, required: false, value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 2, currency: 'usd', description: 'demo service 2', details: 'such description', id: 2, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 4, name: 'service_template_property_4', parent_id: 2, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 4', prop_input_type: 'text', prop_label: 'What is template property 4?', prop_values: null, required: true, value: 'you decide' } ], users: [ { customer_id: null, email: 'user', id: 2, last_login: null, name: null, phone: null, role_id: 3, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 3, currency: 'usd', description: 'demo service 3', details: null, id: 3, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'staff', id: 3, last_login: null, name: null, phone: null, role_id: 2, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 4', details: null, id: 4, interval: null, interval_count: 1, name: 'service_3', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null } ];

    request.get('/api/v1/invoices')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of invoices", function(err, res){
            assert.end();
        }))
});

test('GET /api/v1/service-categories', function (assert) {

    let data = [ { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 1', details: 'nitty gritty', id: 1, interval: null, interval_count: 1, name: 'service_1', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 1, name: 'service_template_property_1', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decide' }, { id: 2, name: 'service_template_property_2', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 2', prop_input_type: 'text', prop_label: 'What is template property 2?', prop_values: null, required: true, value: 'you decide' }, { id: 3, name: 'service_template_property_3', parent_id: 1, private: true, prompt_user: false, prop_class: null, prop_description: 'demo service template property 3', prop_input_type: 'text', prop_label: 'What is template property 3?', prop_values: null, required: false, value: 'you decide' } ], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 2, currency: 'usd', description: 'demo service 2', details: 'such description', id: 2, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { id: 4, name: 'service_template_property_4', parent_id: 2, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 4', prop_input_type: 'text', prop_label: 'What is template property 4?', prop_values: null, required: true, value: 'you decide' } ], users: [ { customer_id: null, email: 'user', id: 2, last_login: null, name: null, phone: null, role_id: 3, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 3, currency: 'usd', description: 'demo service 3', details: null, id: 3, interval: null, interval_count: 1, name: 'service_2', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'staff', id: 3, last_login: null, name: null, phone: null, role_id: 2, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }, { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'demo service 4', details: null, id: 4, interval: null, interval_count: 1, name: 'service_3', overhead: null, published: true, references: { service_categories: [], service_template_properties: [], users: [ { customer_id: null, email: 'admin', id: 1, last_login: null, name: null, phone: null, role_id: 1, status: 'active' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null } ];

    request.get('/api/v1/service-categories')
        .set(baseHeaders)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(responseHandler(assert, data, "Retrieve list of categories", function(err, res){
            assert.end();
        }))
});


test("POST /api/v1/roles/manage-permissions", function(assert){
    reset(function(res){
        assert.same(res, true, "reset worked");
        console.log(res);
        let expected = [ [ { id: 245, permission_id: 1, role_id: 1 }, { id: 246, permission_id: 2, role_id: 1 }, { id: 247, permission_id: 3, role_id: 1 }, { id: 248, permission_id: 4, role_id: 1 }, { id: 249, permission_id: 5, role_id: 1 }, { id: 250, permission_id: 6, role_id: 1 }, { id: 251, permission_id: 7, role_id: 1 }, { id: 252, permission_id: 8, role_id: 1 }, { id: 253, permission_id: 9, role_id: 1 }, { id: 254, permission_id: 10, role_id: 1 }, { id: 255, permission_id: 11, role_id: 1 }, { id: 256, permission_id: 12, role_id: 1 }, { id: 257, permission_id: 13, role_id: 1 }, { id: 258, permission_id: 14, role_id: 1 }, { id: 259, permission_id: 15, role_id: 1 }, { id: 260, permission_id: 16, role_id: 1 }, { id: 261, permission_id: 17, role_id: 1 }, { id: 262, permission_id: 18, role_id: 1 }, { id: 263, permission_id: 19, role_id: 1 }, { id: 264, permission_id: 20, role_id: 1 }, { id: 265, permission_id: 21, role_id: 1 }, { id: 266, permission_id: 22, role_id: 1 }, { id: 267, permission_id: 23, role_id: 1 }, { id: 268, permission_id: 24, role_id: 1 }, { id: 269, permission_id: 25, role_id: 1 }, { id: 270, permission_id: 26, role_id: 1 }, { id: 271, permission_id: 27, role_id: 1 }, { id: 272, permission_id: 28, role_id: 1 }, { id: 273, permission_id: 29, role_id: 1 }, { id: 274, permission_id: 30, role_id: 1 }, { id: 275, permission_id: 31, role_id: 1 }, { id: 276, permission_id: 32, role_id: 1 }, { id: 277, permission_id: 33, role_id: 1 }, { id: 278, permission_id: 34, role_id: 1 }, { id: 279, permission_id: 35, role_id: 1 }, { id: 280, permission_id: 36, role_id: 1 }, { id: 281, permission_id: 37, role_id: 1 }, { id: 282, permission_id: 38, role_id: 1 }, { id: 283, permission_id: 39, role_id: 1 }, { id: 284, permission_id: 40, role_id: 1 }, { id: 285, permission_id: 41, role_id: 1 }, { id: 286, permission_id: 42, role_id: 1 }, { id: 287, permission_id: 43, role_id: 1 }, { id: 288, permission_id: 44, role_id: 1 }, { id: 289, permission_id: 45, role_id: 1 }, { id: 290, permission_id: 46, role_id: 1 }, { id: 291, permission_id: 47, role_id: 1 }, { id: 292, permission_id: 48, role_id: 1 }, { id: 293, permission_id: 49, role_id: 1 }, { id: 294, permission_id: 50, role_id: 1 }, { id: 295, permission_id: 51, role_id: 1 }, { id: 296, permission_id: 52, role_id: 1 }, { id: 297, permission_id: 53, role_id: 1 }, { id: 298, permission_id: 54, role_id: 1 }, { id: 299, permission_id: 55, role_id: 1 }, { id: 300, permission_id: 56, role_id: 1 }, { id: 301, permission_id: 57, role_id: 1 }, { id: 302, permission_id: 58, role_id: 1 }, { id: 303, permission_id: 59, role_id: 1 }, { id: 304, permission_id: 60, role_id: 1 }, { id: 305, permission_id: 61, role_id: 1 }, { id: 306, permission_id: 62, role_id: 1 }, { id: 307, permission_id: 63, role_id: 1 }, { id: 308, permission_id: 64, role_id: 1 }, { id: 309, permission_id: 65, role_id: 1 }, { id: 310, permission_id: 66, role_id: 1 }, { id: 311, permission_id: 67, role_id: 1 }, { id: 312, permission_id: 68, role_id: 1 }, { id: 313, permission_id: 69, role_id: 1 }, { id: 314, permission_id: 70, role_id: 1 }, { id: 315, permission_id: 71, role_id: 1 }, { id: 316, permission_id: 72, role_id: 1 }, { id: 317, permission_id: 73, role_id: 1 }, { id: 318, permission_id: 74, role_id: 1 }, { id: 319, permission_id: 75, role_id: 1 }, { id: 320, permission_id: 76, role_id: 1 }, { id: 321, permission_id: 77, role_id: 1 }, { id: 322, permission_id: 78, role_id: 1 }, { id: 323, permission_id: 79, role_id: 1 }, { id: 324, permission_id: 80, role_id: 1 }, { id: 325, permission_id: 81, role_id: 1 }, { id: 326, permission_id: 82, role_id: 1 }, { id: 327, permission_id: 83, role_id: 1 }, { id: 328, permission_id: 84, role_id: 1 }, { id: 329, permission_id: 85, role_id: 1 }, { id: 330, permission_id: 86, role_id: 1 }, { id: 331, permission_id: 87, role_id: 1 }, { id: 332, permission_id: 88, role_id: 1 }, { id: 333, permission_id: 89, role_id: 1 }, { id: 334, permission_id: 90, role_id: 1 }, { id: 335, permission_id: 91, role_id: 1 }, { id: 336, permission_id: 92, role_id: 1 }, { id: 337, permission_id: 93, role_id: 1 }, { id: 338, permission_id: 94, role_id: 1 }, { id: 339, permission_id: 95, role_id: 1 }, { id: 340, permission_id: 96, role_id: 1 }, { id: 341, permission_id: 97, role_id: 1 }, { id: 342, permission_id: 98, role_id: 1 }, { id: 343, permission_id: 99, role_id: 1 }, { id: 344, permission_id: 100, role_id: 1 }, { id: 345, permission_id: 101, role_id: 1 }, { id: 346, permission_id: 102, role_id: 1 }, { id: 347, permission_id: 103, role_id: 1 }, { id: 348, permission_id: 104, role_id: 1 }, { id: 349, permission_id: 105, role_id: 1 }, { id: 350, permission_id: 106, role_id: 1 }, { id: 351, permission_id: 107, role_id: 1 }, { id: 352, permission_id: 108, role_id: 1 }, { id: 353, permission_id: 109, role_id: 1 }, { id: 354, permission_id: 110, role_id: 1 }, { id: 355, permission_id: 111, role_id: 1 }, { id: 356, permission_id: 112, role_id: 1 }, { id: 357, permission_id: 113, role_id: 1 }, { id: 358, permission_id: 114, role_id: 1 }, { id: 359, permission_id: 115, role_id: 1 }, { id: 360, permission_id: 116, role_id: 1 } ], [ { id: 361, permission_id: 113, role_id: 2 }, { id: 362, permission_id: 114, role_id: 2 } ], [ { id: 363, permission_id: 3, role_id: 3 }, { id: 364, permission_id: 4, role_id: 3 }, { id: 365, permission_id: 6, role_id: 3 }, { id: 366, permission_id: 7, role_id: 3 }, { id: 367, permission_id: 8, role_id: 3 }, { id: 368, permission_id: 24, role_id: 3 }, { id: 369, permission_id: 26, role_id: 3 }, { id: 370, permission_id: 28, role_id: 3 }, { id: 371, permission_id: 29, role_id: 3 }, { id: 372, permission_id: 43, role_id: 3 }, { id: 373, permission_id: 45, role_id: 3 }, { id: 374, permission_id: 46, role_id: 3 }, { id: 375, permission_id: 48, role_id: 3 }, { id: 376, permission_id: 51, role_id: 3 }, { id: 377, permission_id: 53, role_id: 3 }, { id: 378, permission_id: 54, role_id: 3 }, { id: 379, permission_id: 55, role_id: 3 }, { id: 380, permission_id: 56, role_id: 3 }, { id: 381, permission_id: 57, role_id: 3 }, { id: 382, permission_id: 58, role_id: 3 }, { id: 383, permission_id: 65, role_id: 3 }, { id: 384, permission_id: 66, role_id: 3 }, { id: 385, permission_id: 67, role_id: 3 }, { id: 386, permission_id: 68, role_id: 3 }, { id: 387, permission_id: 69, role_id: 3 }, { id: 388, permission_id: 73, role_id: 3 }, { id: 389, permission_id: 77, role_id: 3 }, { id: 390, permission_id: 95, role_id: 3 }, { id: 391, permission_id: 97, role_id: 3 }, { id: 392, permission_id: 98, role_id: 3 }, { id: 393, permission_id: 108, role_id: 3 }, { id: 394, permission_id: 109, role_id: 3 }, { id: 395, permission_id: 110, role_id: 3 }, { id: 396, permission_id: 111, role_id: 3 }, { id: 397, permission_id: 112, role_id: 3 } ] ];
        let newData = [ { permission_ids: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116 ], role_id: 1 }, { permission_ids: [ 113, 114 ], role_id: 2 }, { permission_ids: [ 3, 4, 6, 7, 8, 24, 26, 28, 29, 43, 45, 46, 48, 51, 53, 54, 55, 56, 57, 58, 65, 66, 67, 68, 69, 73, 77, 95, 97, 98, 108, 109, 110, 111, 112 ], role_id: 3 } ]
        request.post('/api/v1/roles/manage-permissions')
            .set(baseHeaders)
            .send(newData)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(responseHandler(assert, expected, "Retrieve map of roles to permissions", function(err, res){
                assert.end();
            }))
    });

})




test("POST /api/v1/service-templates", function(assert){
    reset(function(result){
        let data = { amount: null, category_id: null, currency: 'usd', description: 'BIG TEST', details: 'asdasdasda', interval: null, interval_count: 1, name: 'gotta test', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { name: 'newProp',  private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decaide'  }]}, statement_descriptor: null, subscription_prorate: true, trial_period_days: null };
        let expected = { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'BIG TEST', details: 'asdasdasda', id: 5, interval: null, interval_count: 1, name: 'gotta test', overhead: null, published: true, references: { service_template_properties: [ { id: 5, name: 'newProp', parent_id: 5, private: false, prompt_user: true, prop_class: null, prop_description: 'demo service template property 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'you decaide' } ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null };
        request.post('/api/v1/service-templates')
            .set(baseHeaders)
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(responseHandler(assert, expected, "create new template", function(err, res){
                assert.end();
            }))
    })
});

test("PUT /api/v1/service-templates/1", function(assert){
    reset(function(result){
        let data = { amount: null, category_id: null, currency: 'usd', description: 'BIG TEST', details: 'dasdasddd', interval: null, interval_count: 2, name: 'update', overhead: null, published: true, references: { service_categories: [], service_template_properties: [ { name: 'newProp',  private: false, prompt_user: true, prop_class: null, prop_description: 'change prop 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'change prop'  }]}, statement_descriptor: null, subscription_prorate: true, trial_period_days: null };
        let expected = { amount: null, category_id: null, created_by: 1, currency: 'usd', description: 'BIG TEST', details: 'dasdasddd', id: 1, interval: null, interval_count: 2, name: 'update', overhead: null, published: true, references: { service_template_properties: [ [ { id: 5, name: 'newProp', parent_id: 1, private: false, prompt_user: true, prop_class: null, prop_description: 'change prop 1', prop_input_type: 'text', prop_label: 'What is template property 1?', prop_values: null, required: true, value: 'change prop' } ] ] }, statement_descriptor: null, subscription_prorate: true, trial_period_days: null }
        request.put('/api/v1/service-templates/1')
            .set(baseHeaders)
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(responseHandler(assert, expected, "create new template", function(err, res){
                assert.end();
            }))
    })
});






test.onFinish(function(){
    setTimeout(function(){
        process.exit();
    }, 2000);

})

