let path = require("path");
require('dotenv').config({path: require("path").join(__dirname, '../env/.env')});
const fs = require('fs');

let knex = require("../config/db");


async function buildModelResources() {
    let models = [
        require("../models/charge"),
        require("../models/event-log"),
        require("../models/file"),
        require("../models/fund"),
        require("../models/invitation"),
        require("../models/invoice-line"),
        require("../models/notification-template"),
        require("../models/notifications"),
        require("../models/password-reset-request"),
        require("../models/permission"),
        require("../models/role"),
        require("../models/service-category"),
        require("../models/service-instance"),
        require("../models/service-instance-cancellation"),
        require("../models/service-instance-message"),
        require("../models/service-instance-property"),
        require("../models/service-template-property"),
        require("../models/service-template"),
        require("../models/system-options"),
        require("../models/transaction"),
        require("../models/user"),
        require("../models/base/entity")("webhooks"),
        require("../models/base/entity")("user_permissions")
    ];
    let swaggerResources = {};

    for (let model of models) {
        swaggerResources[model.table] = await buildSwagger(model);
    }

    fs.writeFile('swagger.json', JSON.stringify(swaggerResources), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('defs saved!');
    });

}

async function buildSwagger(model) {
    let schema = await model.getSchema(true, true);
    console.log(schema);
    return Object.entries(schema).reduce((acc, [key, value]) => {
        let property = {};
        console.log(key);
        if (key === "references") {
            let entries = Object.entries(value);
            if (entries.length === 0) {
                return acc;
            }
            acc.properties["references"] = entries.reduce((refAcc, [refKey, refValue]) => {
                refAcc.properties[refKey] = {
                    "type": "array",
                    "items": [
                        {"$ref": "#/definitions/" + refKey}
                    ]
                };
                return refAcc;
            }, {type: "object", properties: {}});
            return acc;
        }
        if (!value.nullable && value.defaultValue === null) {
            if (!acc.required) {
                acc.required = [];
            }
            acc.required.push(key);
        }

        let type = value.type;
        if (key === "password") {
            property.format = "password";
        }
        if (value.maxLength) {
            property.maxLength = value.maxLength
        }
        switch (type) {
            case "character varying":
            case "timestamp with time zone":
            case "text":
                type = "string";
                break;
            case "real":
                type = "number";
                property.format = "float";
                break;
            case "bigint":
                type = "integer";
                property.format = "int64";
                break;
            case "jsonb":
                type = "object";
                break;
            case "ARRAY":
                type = "array";
                property.items = {type: "string", format: "email"};
                break;
            default:
                break;

        }
        property.type = type;
        acc.properties[key] = property;
        console.log(property);
        return acc;

    }, {type: "object", properties: {}})
}

function buildEntityPaths() {
    let resources = [
        {
            endpointName: "users",
            resourceName: "users",
            deletedRoutes: ["post"],
            ownership: true
        },
        {
            endpointName: "event-logs",
            resourceName: "event_logs",
            ownership: false,
        },
        {
            endpointName: "funds",
            resourceName: "funds",
            deletedRoutes: ["delete"],
            ownership: true
        },
        {
            endpointName: "invoices",
            resourceName: "invoices",
            deletedRoutes: ["post", "put", "delete"],
            ownership: true
        },
        {
            endpointName: "notification-templates",
            resourceName: "notification_templates",
            ownership: false
        },
        {
            endpointName: "notifications",
            resourceName: "notifications",
            ownership: true
        },
        {
            endpointName: "permissions",
            resourceName: "user_permissions",
            ownership: false
        },
        {
            endpointName: "roles",
            resourceName: "user_roles",
            ownership: false
        },
        {
            endpointName: "service-categories",
            resourceName: "service_categories",
            ownership: false
        },
        {
            endpointName: "service-instance-cancellations",
            resourceName: "service_instance_cancellations",
            ownership: false
        },
        {
            endpointName: "service-instance-messages",
            resourceName: "service_instance_messages",
            ownership: false
        },
        {
            endpointName: "service-instance-properties",
            resourceName: "service_instance_properties",
            ownership: false
        },
        {
            endpointName: "service-instances",
            resourceName: "service_instances",
            deletedRoutes: ["post"],
            ownership: true
        },
        {
            endpointName: "service-template-properties",
            resourceName: "service_template_properties",
            ownership: false
        },
        {
            endpointName: "service-templates",
            resourceName: "service_templates",
            ownership: false
        },
        {
            endpointName: "webhooks",
            resourceName: "webhooks",
            ownership: false
        }
    ];

    let modelPaths = resources.reduce((acc, resource) => {
        let {endpointName, resourceName, ownership, deletedRoutes} = resource;
        acc[`/${endpointName}`] = {
            get: {
                "summary": "Get " + resourceName,
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": "get_" + endpointName.split("-").join("_"),
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "responses": {
                    "200": {
                        "description": "An array of " + resourceName,
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/" + resourceName
                            }
                        }
                    }
                }
            },
        };
        acc[`/${endpointName}/search`] = {
            get: {
                "summary": "Get " + resourceName,
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": "get_" + endpointName.split("-").join("_") + "_search",
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "parameters": [
                    {
                        "name": "key",
                        "in": "query",
                        "description": "Attribute to search by",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "value",
                        "in": "query",
                        "description": "Value to search for",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "An array of filtered" + resourceName,
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/" + resourceName
                            }
                        }
                    }
                }
            },
        };

        acc[`/${endpointName}/{id}`] = {
            get: {
                "summary": "Get " + resourceName + " by id",
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": `get_${endpointName.split("-").join("_")}_id`,
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": resourceName + " id",
                        "required": true,
                        "type": "number",
                        "format": "double"
                    }
                ],
                "responses": {
                    "200": {
                        "description": resourceName +" with id",
                        "schema": {

                            "$ref": "#/definitions/" + resourceName

                        }
                    }
                }
            }
        };

        if (ownership) {
            acc[`/${endpointName}/own`] = {
                get: {
                    "summary": "Get requester's " + resourceName,
                    "tags": [
                        endpointName
                    ],
                    "produces": [
                        "application/json"
                    ],
                    "operationId": "get_" + endpointName.split("-").join("_") + "_own",
                    "security": [
                        {
                            "internalApiKey": []
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "An array of " + resourceName + ", owned by requester",
                            "schema": {
                                "type": "array",
                                "items": {
                                    "$ref": "#/definitions/" + resourceName
                                }
                            }
                        }
                    }
                }
            };
        }

        if (!deletedRoutes || !deletedRoutes.includes("post")) {
            acc[`/${endpointName}`]["post"] = {
                "summary": "Create new " + resourceName,
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": `post_${endpointName.split("-").join("_")}`,
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "parameters": [
                    {
                        "name": "data",
                        "in": "body",
                        "description": resourceName + " to create",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/" + resourceName
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": resourceName +" with id",
                        "schema": {

                            "$ref": "#/definitions/" + resourceName

                        }
                    }
                }
            }
        }
        if (!deletedRoutes || !deletedRoutes.includes("put")) {
            acc[`/${endpointName}/{id}`]["put"] = {
                "summary": "Update " + resourceName,
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": `put_${endpointName.split("-").join("_")}_id`,
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": resourceName + " id",
                        "required": true,
                        "type": "number",
                        "format": "double"
                    },
                    {
                        "name": "data",
                        "in": "body",
                        "description": "Data to update",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/" + resourceName
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": resourceName +" with id",
                        "schema": {

                            "$ref": "#/definitions/" + resourceName

                        }
                    }
                }
            }
        }
        if (!deletedRoutes || !deletedRoutes.includes("delete")) {
            acc[`/${endpointName}/{id}`]["delete"] = {
                "summary": "Delete " + resourceName + " by id",
                "tags": [
                    endpointName
                ],
                "produces": [
                    "application/json"
                ],
                "operationId": `delete_${endpointName.split("-").join("_")}_id`,
                "security": [
                    {
                        "internalApiKey": []
                    }
                ],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": resourceName + " id",
                        "required": true,
                        "type": "number",
                        "format": "double"
                    }
                ],
                "responses": {
                    "200": {
                        "description": resourceName +" that was deleted",
                        "schema": {

                            "$ref": "#/definitions/" + resourceName

                        }
                    }
                }
            }
        }
        return acc;


    }, {});
    fs.writeFile('model-paths.json', JSON.stringify(modelPaths), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('Models saved!');
    });


}

buildModelResources();
buildEntityPaths();