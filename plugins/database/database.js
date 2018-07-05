let consume = require("pluginbot/effects/consume");
let initializeDB = require("./initialize");
let {call, put} = require("redux-saga/effects")
let populateDB = require("./populate");


let tablesExist = async function(database){
    return (await database("pg_catalog.pg_tables").select("tablename").where("schemaname", "public")).length === 0;
}


module.exports = {
    run : function*(config, provide, services){
        let dbConf = config.dbConfig;
        let initialConfig = null;
        if(!dbConf){
            console.log("No Database config defined, start setup!");
            yield provide({startSetup : {dbConfig : false}});
            console.log("waiting for DB CONFIG");
            dbConf = yield consume(services.dbConfig);
            initialConfig = yield consume(services.initialConfig);
            console.log("got a config");
        }

        let database = require('knex')({
            client: 'pg',
            connection: dbConf
        });

        let isPristine = yield call(tablesExist, database);
        if(isPristine){
            console.log("DB EMPTY");
            if(!initialConfig){
                console.log("starting setup");
                yield provide({startSetup : {dbConfig : true}});
                initialConfig = yield consume(services.initialConfig);
            }
            yield call(initializeDB, database);
            console.log("Tables created - now populating with data");
            yield call(populateDB, database, initialConfig);
            console.log("Initialization complete!!!!!");
        }else{

            //todo: move this to a plugin
            let migrate = require("./migrations/migrate");
            yield call(migrate, database);
            //todo : implement new system options?
            //check migrate
            //check new system options?
        }

        database.createTableIfNotExist = function(tableName, knexCreateTable, db=database){
            return db.schema.hasTable(tableName).then(function(exists){
                if(!exists){
                    return db.schema.createTable(tableName, knexCreateTable);
                }else{
                    console.log("Table: " + tableName + " Already Exists, no need to create")
                    return false;
                }
            })
        };

        yield provide({database});




    }
}