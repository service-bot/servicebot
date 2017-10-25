let consume = require("pluginbot/effects/consume");
const CORE_INPUTS = require("./core-inputs");
module.exports = {
    run: function* (config, provide, services) {
        let widgets = CORE_INPUTS.map(input => {
            let widget = require(`./${input}/widget`).default;
            if(widget){
                return widget;
            }else{
                throw input + " has no widget defined";
            }
        });
        yield provide({widget : widgets});
    }

};