let consume = require("pluginbot/effects/consume");
const CORE_INPUTS = require("./core-inputs");
module.exports = {
    run: function* (config, provide, services) {
        let handlers = CORE_INPUTS.map(input => {
            try {
                let handler = require(`./${input}/widgetHandler`);

                if (handler && (handler.priceHandler || handler.validator)) {
                    return {handler, name: input};
                }
            }catch(e){
                return {name : input};
            }
        });
        yield provide({inputHandler : handlers});
    }

};