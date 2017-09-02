import React from "react";
import handler from "./widgetHandler";
let Checkbox = (props) => {
    return <input {...props.input} type="checkbox"/>
};
let Price = (props) => {
    return <input {...props.input} type="number"/>;
}

let widget = {widget : Checkbox, type : "checkbox", label : "Checkbox", pricing:Price, handler : handler };


export default widget