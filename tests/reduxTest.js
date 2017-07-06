require('dotenv').config({path: require("path").join(__dirname, '../env/.env')});

let store = require("../config/redux/store");
let triggerEvent = require("../config/redux/actions").triggerEvent;


store.buildEventReducer(store).then((result) => {
    console.log(result);
    store.dispatch(triggerEvent("great_event", {"asdasd" : "p"}));
});



