require('dotenv').config({path: require("path").join(__dirname, '../env/.env')});

let store = require("../config/redux/store");
let triggerEvent = require("../config/redux/actions").triggerEvent;


store.initialize().then((result) => {
    console.log(result);
    console.log("HUH")
    store.dispatch(triggerEvent("request_service_instance_admin", {"asdasd" : "p"}));
});



