import React from "react";
import handler from "./widgetHandler";
import {priceField} from "../../views/components/elements/forms/servicebot-base-field.jsx";
let Checkbox = (props) => {
    return <input {...props.input} type="checkbox"/>
};
let Price = (props) => {
    return <input {...props.input} type="number"/>;
}

let widget = {widget : Checkbox, type : "checkbox", label : "Checkbox", pricing:priceField, handler : handler };


export default widget