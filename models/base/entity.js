let knex = require('../../config/db.js');
let _ = require('lodash');
let Promise = require("bluebird");
let promiseProxy = require("../../lib/promiseProxy");
var whereFilter = require('knex-filter-loopback').whereFilter;

//TODO - BIG TASK - relationship system, allow to define relationships in model and relationship tables - would autodelete rel rows
//TODO - Big task - full promise support..........
//todo - big task - refactor ORM completely....
/**
 *
 * @param tableName - name of table the entity belongs to
 * @param primaryKey
 * @param references - follows format
 * @param database - database object
 * @returns {Entity}
 */

var CreateEntity = function (tableName, references = [], primaryKey = 'id', database = knex) {
    var Entity = function (data) {
        let self = this;
        this.data = data;
        // this.references = new Proxy({}, {
        //     get: async function (target, name) {
        //         let reference = references.find(ref => ref.model.table === name);
        //         try {
        //             if (!reference) {
        //                 
        //                 throw `Reference is not defined on ${Entity.table}.`
        //             }
        //             return await self.getRelated(reference.model)
        //         }catch(e){
        //             console.error("ERRRRROR!!!!", e);
        //         }
        //     }
        //
        // });
    };

    Entity.database = database;
    Entity.table = tableName;
    Entity.primaryKey = primaryKey;
    Entity.references = references;

    Entity.prototype.data = {};

    //introduced to support plugins
    Entity.changeDB = (db) => {
        Entity.database = db;
    };

    Entity.prototype.get = function (name) {
        return this.data[name];
    }

    Entity.prototype.set = function (name, value) {
        this.data[name] = value;
    }

    function getRelated(model, callback) {
        if (Entity.references == null || Entity.references.length == 0) {
            callback([]);
        }
        let self = this;
        let reference = Entity.references.find(rel => rel.model.table == model.table);
        if (!reference) {
            callback([]);
            return;
        }
        let referenceModel = reference.model;
        let referenceField = reference.referenceField;
        if (reference.direction === "from") {
            referenceModel.findOnRelative(referenceField, self.get("id"), function (results) {
                callback(results);
            })
        }
        else if (reference.direction === "to") {
            referenceModel.findOnRelative(referenceModel.primaryKey, self.get(referenceField), function (results) {
                callback(results);
            })
        }

    };

    Entity.createPromise = function (entityData) {
        let self = this
        return Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                return _.pick(entityData, _.keys(info));
            })
            .then(function (data) {
                return Entity.database(Entity.table).returning("*").insert(data)
            })
            .then(function (result) {
                return result[0];
            })
            .catch(function (err) {
                throw err
            });
    };
    Entity.prototype.create = function (callback) {
        let self = this;
        Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                return _.pick(self.data, _.keys(info));
            })
            .then(function (data) {
                Entity.database(Entity.table).returning(primaryKey).insert(data)
                    .then(function (result) {
                        self.set(primaryKey, result[0]);
                        callback(null, self);
                    })
                    .catch(function (err) {
                        callback(err);
                    });
            })
    };


    function update(callback) {
        var self = this;
        var id = this.get(primaryKey);
        if (!id) {
            throw "cannot update non existent"
        }
        Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                self.data.updated_at = new Date();
                return _.pick(self.data, _.keys(info));
            })
            .then(function (data) {
                Entity.database(Entity.table).where(primaryKey, id).update(data).returning("*")
                    .then(function (result) {
                        callback(null, new Entity(result[0]));
                    })
                    .catch(function (err) {
                        console.error(err);
                        callback(err.detail);
                    });
            })

    };

    Entity.prototype.delete = function (callback) {
        let id = this.get('id');
        Entity.database(Entity.table).where('id', id).del()
            .then(function (res) {
                callback(null, res);
            })
            .catch(function (err) {
                console.error(err);
                callback(err.detail);
            });
    };

    let attachReferences = function (callback) {
        this.data.references = {};
        let self = this;
        if (references == null || references.length == 0) {
            return callback(self);
        }
        for (let reference of references) {
            let referenceModel = reference.model;
            this.getRelated(referenceModel, function (results) {
                self.data.references[referenceModel.table] = results.map(entity => entity.data);
                if (Object.keys(self.data.references).length == references.length) {
                    callback(self);
                }
            });
        }
    }


    Entity.prototype.createReferences = function (referenceData, reference, callback) {
        let self = this;
        if (reference.readOnly) {
            
            callback(self);
        }
        else {
            referenceData.forEach(newChild => (newChild[reference.referenceField] = this.get(primaryKey)));
            //
            //console.log(referenceData);
            reference.model.batchCreate(referenceData, function (response) {
                if (reference.direction == "to") {
                    self.set(reference.referenceField, response[0][reference.model.primaryKey]);
                    self.update(function (err, updatedEntity) {
                        self.data.references[reference.model.table] = response;
                        callback(self);
                    })
                }
                else {
                    self.data.references[reference.model.table] = response;
                    callback(self);
                }
            })
        }
    }

    //todo - combine stuff into a single query
    //todo - possibly dispatch events
    Entity.prototype.updateReferences = async function (referenceData, reference, isTransaction=false) {
        let self = this;
        if (reference.readOnly) {
            
            this;
        }
        else {
            console.error(referenceData, reference);
            let ids = referenceData.reduce((acc, refInstance) => acc.concat(refInstance.id || []), []);
            referenceData.forEach(newChild => (newChild[reference.referenceField] = this.get(primaryKey)));

            let references = await this.getRelated(reference.model.table);
            let removedReferences = await reference.model.batchDelete({
                not: {id: {"in": ids}},
                [reference.referenceField]: self.get(primaryKey)
            });
            
            let upsertedReferences = await reference.model.batchUpdate(referenceData, true, isTransaction);

            //change "to" reference if it's different
            if(reference.direction === "to" && upsertedReferences[0][reference.model.primaryKey] !== self.get(reference.referenceField)){
                self.set(reference.referenceField, upsertedReferences[0][reference.model.primaryKey]);
                await self.update();
            }

            return upsertedReferences;


        }
    };

    //TODO: think about no result case, not too happy how handling it now.

    //Also want to think about having generic find method all models would use
    Entity.findAll = function (key = true, value = true, callback) {
        Entity.database(Entity.table).where(key, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new Entity(e));
                callback(entities);
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    //best one! (todo... clean up ORM cuz it sucks)
    Entity.find = async function (filter = {}, attatchReferences = false) {
        try {
            let result = await Entity.database(Entity.table).where(whereFilter(filter));
            let entities = result ? result.map(e => new Entity(e)) : [];
            if(attatchReferences){
                entities = await Entity.batchAttatchReference(entities);
            }
            return entities;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    //Find on relative function will call the findAll function by default. Allowing overrides at a model layer.
    Entity.findOnRelative = function (key = true, value = true, callback) {
        Entity.findAll(key, value, function (result) {
            callback(result);
        })
    };

    Entity.findAllByOrder = function (key, value, orderBy, sortMethod, callback) {
        Entity.database(Entity.table).orderBy(orderBy, sortMethod).where(key, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new Entity(e));
                callback(entities);
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    let findOne = function (key, value, callback) {
        Entity.database(Entity.table).where(key, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                callback(new Entity(result[0]));
            })
            .catch(function (err) {
                console.error(err);
            });
    };
    //Generic findById function. Finds the record by passing the id.
    Entity.findById = function (id, callback) {
        Entity.database(Entity.table).where('id', id)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                callback(new Entity(result[0]));
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    let getSchema = function (includeTo, includeFrom, callback) {
        //get column info for this entity
        Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                let schema = info;
                schema.references = {};
                Entity.references.reduce(function (promise, relationship) {
                    if ((relationship.direction == "to" && !includeTo) || (relationship.direction == "from" && !includeFrom)) {
                        return promise;
                    }

                    //reduce by returning same promise with .then for each relationship where the schema has the relationship added
                    return promise.then(function () {
                        return Entity.database(relationship.model.table).columnInfo().then(function (relInfo) {
                            schema.references[relationship.model.table] = relInfo;
                        })
                    })
                }, Promise.resolve()).then(function (result) {
                    callback(schema);
                })
            });

    };

    //gets results that contain the value

    Entity.search = function (key, value, callback) {
        let query = "LOWER(" + key + ") LIKE '%' || LOWER(?) || '%' "
        if (value % 1 === 0) {
            query = key + " = ?";
        }
        Entity.database(Entity.table).whereRaw(query, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new Entity(e));
                callback(entities);
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    //Returns the total number of rows for the Entity Table

    Entity.getRowCountByKey = function (key, value, callback) {
        let query = Entity.database(Entity.table).count();
        if (key) {
            query.where(key, value)
        }
        query.then(function (result) {
            callback(result[0].count);
        })
            .catch(function (err) {
                console.error(err);
            });
    };

    Entity.getSumOfColumnFiltered = function (column, key, value, callback) {
        let query = Entity.database(Entity.table).sum(column);
        if (key) {
            query.where(key, value)
        }
        query.sum(column)
            .then(function (result) {
                callback(result[0].sum);
            })
            .catch(function (err) {
                console.error(err);
            });
    };
    //get objects created between dates
    Entity.findBetween = function (from, to, dateField = 'created', callback) {
        Entity.database(Entity.table).whereBetween(dateField, [from, to])
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new Entity(e));
                callback(entities);
            })
            .catch(function (err) {
                console.error(err);
            });
    };




    async function getReferences(reference, filter={}) {
        let refTable = reference.model.table
        let referenceField = reference.referenceField;
        let join = [refTable];

        if (reference.direction === "from") {
            join.push(`${refTable}.${referenceField}`, `${Entity.table}.${Entity.primaryKey}`)
        }
        else if (reference.direction === "to") {
            join.push(`${refTable}.${reference.model.primaryKey}`, `${Entity.table}.${referenceField}`)
        }

        let results = await Entity.database(Entity.table)
            .select(`${Entity.table}.${Entity.primaryKey} as parent_key`, `${refTable}.*`)
            .leftJoin(...join).where(whereFilter(filter));
        return results.reduce((acc, row) => {
            let parent_key = row.parent_key;
            delete row.parent_key;
            if(row[reference.model.primaryKey]){
                acc[parent_key] = (acc[parent_key] || []).concat(row);
            }
            return acc;
        }, {})
    }

    Entity.batchAttatchReference = async function (entities) {

        if (Entity.references === null || Entity.references.length === 0) {
            return entities;
        }

        let ids = entities.map(entity => entity.data[Entity.primaryKey]);
        let key =`${Entity.table}.${Entity.primaryKey}`
        let filter = {[key] : {"in" : ids}};
        for(let reference of Entity.references){
            let referenceData = await getReferences(reference, filter);
            entities = entities.map(entity => {
                entity.data["references"] = {
                    ...entity.data["references"],
                    [reference.model.table] : referenceData[entity.data[Entity.primaryKey]] || []
                }
                return entity;
            })
        }
        return entities

    };
    Entity.batchDelete = async function (filter) {
        return knex(Entity.table).where(whereFilter(filter)).del().returning("*");
    };
    /**
     *
     * @param dataArray - array of data objects that are going to be inserted
     * @param callback
     */

        //todo: refactor..
    let batchCreate = function (dataArray, callback) {
            Entity.database(Entity.table).columnInfo()
                .then(function (info) {
                    return dataArray.map(function (entity) {
                        return _.pick(entity, _.keys(info));
                    })
                })
                .then(function (data) {
                    Entity.database(Entity.table).insert(data).returning("*")
                        .then(function (result) {
                            callback(result)
                        })
                        .catch(function (err) {
                            console.error(err);
                        })
                })
        };

    //TODO: figure out if updateReferences is even needed, if it is figure out how to remove it.
    Entity.batchUpdate = async function (dataArray, updateReferences, isTransaction=false) {
        let columns = await Entity.database(Entity.table).columnInfo()
        let data = dataArray.map(function (entity) {
            return _.pick(entity, _.keys(columns));
        })
        let transaction = Entity.database.transaction;
        if(isTransaction){
            transaction = async (callback) => {
                return callback(Entity.database);
            }
        }
        return await transaction(async function (trx) {
            return Promise.map(data, async function (entityData, index) {
                let record;
                if (entityData[Entity.primaryKey]) {
                    record = (await trx.from(Entity.table).where(Entity.primaryKey, entityData[Entity.primaryKey]).update(entityData).returning("*"))[0];
                } else {
                    record = (await trx.from(Entity.table).insert(entityData).returning("*"))[0];
                }

                if(updateReferences && dataArray[index].references){
                    record.references = dataArray[index].references;
                    for(let [refName, refValues] of Object.entries(dataArray[index].references)){
                        let reference = references.find(ref => ref.model.table === refName);
                        if(reference && !reference.readOnly){
                            let trxReference = CreateEntity(reference.model.table, reference.model.references, reference.model.primaryKey, trx);
                            let ids = refValues.reduce((acc, refInstance) => acc.concat(refInstance.id || []), []);
                            let removedReferences = await trxReference.batchDelete({
                                not: {id: {"in": ids}},
                                [reference.referenceField]: record[Entity.primaryKey]
                            });
                            let refsToUpdate = refValues.reduce((acc, val) => {
                                if(val[reference.model.primaryKey]){

                                     //make sure that the referenceField is pointing properly
                                    if(reference.direction === "from" && val[reference.referenceField] === record[Entity.primaryKey]){
                                        acc.push(val);

                                    }else if(reference.direction === "to" && record[reference.referenceField] === val[reference.model.primaryKey]){
                                        acc.push(val);
                                    }
                                }else{
                                    if(reference.direction === "from"){
                                        
                                        val[reference.referenceField] = record[Entity.primaryKey];
                                        acc.push(val);

                                    }
                                }
                                return acc;
                            }, []);
                            record.references[reference.model.table] = (await trxReference.batchUpdate(refsToUpdate, true, true)) || [];
                            

                        }
                    }
                }
                
                return record;
            });
        });

    };
    Entity.prototype.update = promiseProxy(update, false);
    Entity.findOne = promiseProxy(findOne);
    Entity.prototype.attachReferences = promiseProxy(attachReferences);
    Entity.prototype.getRelated = promiseProxy(getRelated);
    Entity.batchCreate = promiseProxy(batchCreate);
    Entity.getSchema = promiseProxy(getSchema);


    return Entity;
}
module.exports = CreateEntity;