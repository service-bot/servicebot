let {put, call, select, all} = require("redux-saga/effects");
let {  setOptions }  =  require("../../config/redux/actions");
let consume = require("pluginbot/effects/consume");
let routes = require("./routes");


//todo: move population of initial to this plugin.

//todo: handle bad plugin options - errors will suck now probably - don't like all these parameters either../
function* getPluginOptions(publicOnly=false, valueOnly=false){

    //todo: 🚨🚨🚨🚨 pluginbot needs consume current - this is currently bad practice since it's not consuming services.
    let pluginOptions = yield select((state) => state.pluginbot.services.pluginOption)
    let optionEffecs = {};
    for(let option of pluginOptions || []){
        if(!publicOnly || option.visible) {
            optionEffecs[option.name] = call(function* () {
                let value = yield call([option, "getOption"]);
                return valueOnly ? value : {...option.data, value, plugin : true}
            })
        }
    }
    return yield all(optionEffecs);
}

module.exports = {
    run: function* (config, provide, services) {
        let db = yield consume(services.database);
        let Settings = require('../../models/system-options');
        let defaultOptions = require("./default-options");

        //populate options
        yield call(defaultOptions.populateOptions, defaultOptions.options, Settings);
        let initialOptions = yield call(Settings.getOptions);

        //todo: this is bad - can lose properties in initialization because not consuming. - fix by consuming!
        let pluginOptions = yield call(getPluginOptions, false, true)

        yield put(setOptions({...initialOptions, ...pluginOptions}));

        //todo: fix complexity due to the split between system option in model and options provided by plugins
        //Configuration service is how the app interfaces with plugin's configurations.
        let configurationManager = {

            getConfigurations : function*(publicOnly=false){

                let publicOptions = yield call(Settings.find, publicOnly ? {"public" : true} : {});


                let results = publicOptions.reduce((acc, entity) => {
                    acc[entity.data.option] = entity.data;
                    return acc;
                }, {});
                let pluginResults = yield call(getPluginOptions, publicOnly);
                return {...results, ...pluginResults};

            },

            getConfiguration : function*(name){
                //todo make this not have to get everything...
                let settings =  yield call(configurationManager.getConfigurations);
                return settings[name];

            },
            updateConfigurations : function*(settingsArray, publicOnly=false) {
                //this is messy because of the two different places settings currentlh live
                //refactoring would mean all settings are in plugins
                let publicSettings = yield call(configurationManager.getConfigurations, publicOnly)
                let groupedUpdates = settingsArray.reduce((acc, optionToUpdate) => {
                    let publicSetting = publicSettings[optionToUpdate.option]
                    if(publicSetting){
                        acc[publicSetting.plugin ? "plugin" : "core"].push(optionToUpdate);
                    }
                    return acc;
                }, {plugin : [], core : []});

                //todo: batchUpdate needs to stop proxying... can't call on it.
                let updatedCore = yield Settings.batchUpdate(groupedUpdates.core);

                //todo: 🚨🚨🚨🚨 pluginbot needs consume current - this is currently bad practice since it's not consuming services.
                let pluginOptions = (yield select((state) => state.pluginbot.services.pluginOption)) || [];
                let mappedPluginOption = pluginOptions.reduce((acc, option) => {
                    acc[option.name] = option;
                    return acc;
                }, {});

                let updatedPlugin = [];
                for(let pluginOptionToUpdate of groupedUpdates.plugin){
                    let setter = mappedPluginOption[pluginOptionToUpdate.option].setOption;
                    if(setter) {
                        updatedPlugin.push(call(setter, pluginOptionToUpdate.value));
                    }
                }

                let updateResult = yield all(updatedPlugin);

                return [...updatedCore, ...updateResult];




            }

        };
        let routeDefinition = yield call(routes, configurationManager);
        yield provide({routeDefinition, configurationManager})
        let initialPublic = yield call(configurationManager.getConfigurations, true);

        //app needs options todo: can this be done better?
        yield put({type: "FINISHED_SETUP", options : initialPublic });

    }

};