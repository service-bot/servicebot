// import appReducer from "./test/views/reducer.js"
   let types = require("./getWidgets");
    console.log(types);

let handlers = types.reduce(function (acc, type) {
    let widget = require(`./${type}/widgetHandler.js`).default;
    acc[type] = widget;
    return acc;
}, {});
// reducers["test"] = appReducer

module.exports = handlers;

