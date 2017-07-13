
var SystemOption = require("./base/entity")("system_options", [], "option");

SystemOption.getOptions = function(){
    return new Promise((resolve, reject) => {
        SystemOption.findAll(true, true, (result) => {
            resolve(result.reduce((settings, setting)=>{
                settings[setting.data.option] = setting.data.value;
                return settings;
            }, {}))
        })
    })
}


module.exports = SystemOption;