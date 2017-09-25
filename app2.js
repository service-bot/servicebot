module.exports = async function(configPath) {
    let Pluginbot = require("pluginbot");
    let path = require("path");
    let app = await Pluginbot.createPluginbot(configPath)
    await app.initialize();
    console.log("SERVICEBOT STARTING!");
    return app;
};