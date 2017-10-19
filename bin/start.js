let path = require("path");
const CONFIG_PATH = process.env.CONFIG_PATH || path.resolve(__dirname, "../config/pluginbot.config.js");

module.exports = require("../app")(CONFIG_PATH).then(app => {

    //todo: this can be removed when we refactor app.
    let store = app.store;
    require("../config/redux/store").setStore(store);
});