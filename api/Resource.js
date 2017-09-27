const express = require('express');
let Entity = require("../models/base/entity");
let EntityRoutes = require("../api/entity");

class ResourceDefinition {

    constructor(modelConfig, routeConfig, database){
        let newRouter = express.Router();
        let {tableName, references, primaryKey} = modelConfig;
        let {resourceName, userCorrelator} = routeConfig;
        this.model = Entity(tableName, (references || []), (primaryKey || "id"), database);
        this.routes = EntityRoutes(newRouter, this.model, resourceName, userCorrelator);
        this.routeConfig = routeConfig;
        this.modelConfig = modelConfig;
        this.name = resourceName;
        this.database = database;
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.userCorrelator = userCorrelator;

    }

    async isOwner(resourceId, userId){
        if(this.userCorrelator === undefined){
            throw `${this.name} cannot have an owner`;
        }
        return await this.database(this.tableName).where(this.userCorrelator, userId).andWhere(this.primaryKey, resourceId);
    }

}

module.exports = ResourceDefinition;