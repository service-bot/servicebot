// import appReducer from "./test/views/reducer.js"

    let widgets = require("servicebot_input_types").reduce(function (acc, type) {
        let widget = require(`./${type}/widget.js`).default;
        acc[widget.type] = widget;
        return acc;
    }, {});
// reducers["test"] = appReducer

module.exports = widgets;

