import React from "react";
import {Field} from "redux-form";
import TagsInput from "react-tagsinput"


let SelectWidget = (props) => {
    let {input, configValue} = props;
    return (<select {...input}>
        { configValue && configValue.map((option, index) =>  <option key={index} value={option}>{option}</option>)}
    </select>)
};

let Text = (props) => {
    return <input {...props.input} type="text"/>
};
let Checkbox = (props) => {
    return <input {...props.input} type="checkbox"/>
};
let Tags = (props) => {
    return  <TagsInput  {...props.input} value={props.input.value || []}/>
};



const widgets = [
    {widget : Text, type : "text", label : "Text"},
    {widget : Checkbox, type : "checkbox", label : "Checkbox"},
    {widget : SelectWidget, type : "select", label : "Select", config : Tags}
];



const RenderWidget = (props) => {
    const {member, widgetType, configValue, defaultWidgetValue} = props;
    const widget = widgets.filter(w => w.type == widgetType)[0];

    return (<div>
        {widget.config && <Field name={`${member}.config`} component={widget.config}/>}
        <br/>
        <label>Default Value</label>
        {widget.widget && <Field name={`${member}.value`} configValue={configValue} component={widget.widget}/>}
    </div>)
}






let WidgetList = props => (<Field name={props.name} id={props.name} component="select">
    <option />
    {widgets.map((widget, index) => <option key={index} value={widget.type}>{widget.label}</option>)}
</Field>);

export {RenderWidget, WidgetList, widgets, SelectWidget}