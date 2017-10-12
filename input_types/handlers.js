// import appReducer from "./test/views/reducer.js"

module.exports = function(){
    let types = require("./getWidgets")();
    let handlers = types.reduce(function (acc, type) {
        try {
            let widget = require(`./${type}/widgetHandler.js`)  ;
            acc[type] = widget;
        }catch(e){
            console.log("no handler for : " + type);
        }
        return acc;
    }, {});
    return handlers;

// reducers["test"] = appReducer

};

