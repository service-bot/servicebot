let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

function* run(config, provide, channels) {
        let db = yield consume(channels.database);

        let fileManager = {
                middleware : function(req, res, next){

                },
                getFile : function(id){

                },
                //todo : this should be deprecated in future - everythign should be ID
                getFileByPath : function(path, prefix){

                },
                deleteFile : function(id){

                },
        }
}
module.exports = {run};