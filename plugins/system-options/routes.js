let sagaMiddleware = require("../../middleware/express-saga-middleware");
let {call, put, all, select} = require("redux-saga/effects");
let {triggerEvent} = require("../../config/redux/actions");

module.exports = function*(configurationManager){

    function* getPublic(req, res, next) {
        let publicOptions = yield call(configurationManager.getConfigurations, true)
        yield call([res, "json"], publicOptions);
    }

    function* updatePublic(req, res, next){
        let updates = yield call(configurationManager.updateConfigurations, req.body, true);
        //todo: why is this so stupid
        let reduced = updates.reduce((settings, setting)=>{
            settings[setting[0].option] = setting[0].value;
            return settings;
        }, {});
        yield call([res, "json"], reduced);
        yield put(triggerEvent("system_options_updated", reduced));
    }
    function getSecret(req, res){
        res.json({secret: process.env.SECRET_KEY})
    }

    //todo: maybe api gateway can make saga middleware?
    let getPublicMiddleware = yield call(sagaMiddleware, getPublic);
    let putPublicMiddleware = yield call(sagaMiddleware, updatePublic);

    let routeDefinition = [
        {
            endpoint : "/system-options/public",
            method : "get",
            middleware : [getPublicMiddleware],
            permissions : [],
            description : "Get public system options"

        },
        {
            endpoint : "/system-options",
            method : "put",
            middleware : [putPublicMiddleware],
            permissions : ["put_system_options"],
            description : "Updates public system options"

        },
        {
            endpoint : "/system-options/secret",
            method : "get",
            middleware : [getSecret],
            permissions : ["can_administrate"],
            description : "Get Secret Key"

        },
    ];

    return routeDefinition;
}
