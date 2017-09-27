let path = require("path");
const CONFIG_PATH = path.resolve(__dirname, "../config/pluginbot.config.js");

require("../app2")(CONFIG_PATH).then(servicebot => {
    console.log("servicebot initted!")
}).catch(error => {
    console.error("ERROR!", error);
});