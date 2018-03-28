let {fork} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");

module.exports = function*(resourceDefinitionChannel){
    yield fork(function* () {
        while(true){
            let ResourceDefinition = yield consume(resourceDefinitionChannel);

        }
    });

};


function buildResourceEntityRoutes(model, routeDefinition){

}