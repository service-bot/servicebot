let consume = require("pluginbot/effects/consume");
const text = require("./text/widget").default;
module.exports = {
    run: function* (config, provide, services) {
        yield provide({widget : text});
    }

};