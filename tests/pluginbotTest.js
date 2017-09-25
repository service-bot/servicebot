
const CONFIG_PATH = "/Users/ben/WebstormProjects/testbot/config/pluginbot.config.js";

require("../app2")(CONFIG_PATH).then(servicebot => {
    console.log("servicebot initted!")
}).catch(error => {
    console.error("ERROR!", error);
});