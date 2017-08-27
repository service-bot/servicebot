import React from "react";
import {Field, FormSection} from "redux-form";
import TagsInput from "react-tagsinput"
import widgets from "../../../input_types/widgets";
var values = require('object.values');
if (!Object.values) {
    values.shim();
}
let PriceOperation = (props) => {
    let {input} = props;
    return (<select {...input}>
        <option value="add">Add</option>
        <option value="subtract">Subtract</option>
        <option value="divide">Percent Decrease</option>
        <option value="multiply">Percent Increase</option>
    </select>)
};




const RenderWidget = (props) => {
    const {member, widgetType, configValue, defaultWidgetValue} = props;
    const widget = widgets[widgetType];

    return (<div>
        <FormSection name={`${member}.config`}>
            {widget.config && <Field name={`value`} component={widget.config}/>}
            {widget.pricing &&
            <div>
                <FormSection name={`pricing`}>
                    <Field name={`value`} configValue={configValue} component={widget.pricing}/>
                    <Field name="operation" component={PriceOperation}/>
                </FormSection>
            </div>}

        </FormSection>
        <br/>
        <label>Default Value</label>
        {widget.widget && <Field name={`${member}.data.value`} configValue={configValue} component={widget.widget}/>}
    </div>)
}

const PriceBreakdown = (props) => {
    const { inputs } = props

    var breakdown = inputs.reduce((acc, input) => {
        console.log(input, "INPUT!");
        if(input.config && input.config.pricing && widgets[input.type].handler.priceHandler) {
            acc.push(<div>{input.prop_label} - {input.config.pricing.operation}
                - {widgets[input.type].handler.priceHandler(input.data, input.config)}</div>);
        }
        return acc;
    }, [])

    if (breakdown.length == 0){
        breakdown =  <div></div>
    }
    return <div>
        {breakdown}
    </div>
}





let WidgetList = props => (<Field name={props.name} id={props.name} component="select">
    <option />
    {Object.values(widgets).map((widget, index) => <option key={index} value={widget.type}>{widget.label}</option>)}
</Field>);

export {RenderWidget, WidgetList, PriceBreakdown, widgets}