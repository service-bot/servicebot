//todo, integrate this into a plugin.

let { EVENT, SET_OPTIONS,SET_EVENT_SAGAS, INIT_STORE, setOptions ,setEventSagas, initializeStore, triggerEvent}  =  require("./config/redux/actions");
const defaultAppState = {
    "eventReducer" : null,
    "eventSagas" : {},
    "options" : {}
};

function appReducer(state = defaultAppState , action) {
    //change the store state based on action.type
    switch(action.type) {
        case EVENT:
            return state;
        case INIT_STORE:
            return action.initialStore;
        case SET_OPTIONS :
            let options = Object.assign({}, state.options, action.options);
            return Object.assign({}, state, {
                "options" : options
            })
        default:
            return state;
    }
}



module.exports = async function(configPath) {
    try {
        let Pluginbot = require("pluginbot");
        let path = require("path");
        let app = await Pluginbot.createPluginbot(configPath)
        await app.initialize({"servicebot": appReducer});
        return app;
    }catch(e){
        console.error(e);
    }
};