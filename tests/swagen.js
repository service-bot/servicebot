let knex = require("../config/db");


let ServiceTemplate = require("../models/service-template");
let ServiceTemplateProperties = require("../models/service-template-property");
let ServiceCategorites = require("../models/service-category");
let ServiceInstance = require("../models/service-instance");
let ServiceInstanceProperties = require("../models/service-instance-property");
let ServiceInstanceMessages = require("../models/service-instance-message");
let ChargeItems = require("../models/charge");
let ServiceInstanceCancellation = require("../models/service-instance-cancellation");
let Users = require("../models/user");
let Roles = require("../models/role");
let EventLogs = require("../models/event-log");
let NotificationTemplates = require("../models/notification-template");
let Invoice = require('../models/invoice');
let InvoiceLine = require("../models/invoice-line");
let Transactions = require("../models/transaction");
let SystemOptions = require("../models/system-options");
let Files = require("../models/file");

console.log(knex.fn.now());


function genProp(data){
    let returnProp = {}
    if(data.type == "character varying"){
        returnProp.type = "string"
    }else{
        returnProp.type = data.type;
    }
    if(data.maxLength){
        returnProp.maxLength = data.maxLength;
    }
    returnProp.required = !data.nullable;
    returnProp.description = "FILL ME OUT!!!!";
    return returnProp;

}
function generate(model){
    model.getSchema(true, true, function(schema){
        let json = {type:"object", properties:{}};
        for(let prop in schema){
            if(prop == "references"){
                let newProp = {type: "object", properties:{}};
                for(let refProp in schema[prop]){
                    newProp.properties[refProp] = {type : "array", items: [{ $ref: '#/definitions/' + refProp}]}
                }
                json.properties[prop] = newProp;
            }else {
                json.properties[prop] = genProp(schema[prop])
            }
        }
        console.log(JSON.stringify(json));
    });
}

generate(Files);