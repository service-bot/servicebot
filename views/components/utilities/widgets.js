import React from "react";
import {Field, FormSection} from "redux-form";
import TagsInput from "react-tagsinput"
import {inputField, selectField, priceField} from "servicebot-base-form";
import consume from "pluginbot-react/dist/consume";

const values = require('object.values');
if (!Object.values) {
    values.shim();
}
let PriceOperation = (props) => {
    let {input} = props;
    return (
        <select {...input}>
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
            <option value="divide">Percent Decrease</option>
            <option value="multiply">Percent Increase</option>
        </select>
    )
};

let RenderWidget = (props) => {
    const {showPrice, member, currency, widgetType, configValue, defaultWidgetValue} = props;
    const widget = props.services && props.services.widget && props.services.widget.find(widgetToCheck => widgetToCheck.type === widgetType);
    if (!widget) {
        return <React.Fragment/>
    }
    return (
        <React.Fragment>
            <FormSection name={`${member}.config`} className={`form-section`}>
                {widget.config && <Field name={`value`} component={widget.config}/>}
                {widget.pricing && showPrice &&
                <div className="addon-widget-has-pricing">
                    <FormSection name={`pricing`} className={`form-section`}>
                        <Field name="operation" component={selectField} label="Apply Price Change"
                               options={[
                                   {id: "add", name: "Add to base price"},
                                   {id: "subtract", name: "Subtract from base price"},
                                   {id: "multiply", name: "Percent add to base price"},
                                   {id: "divide", name: "Percent off from base price"},
                               ]}/>

                        <div className="sb-form-group _group-addon-pricing">
                            <label className="_label-">Add-On Pricing</label>
                            <Field name={`value`} currency={currency} configValue={configValue} component={widget.pricing}/>
                        </div>
                    </FormSection>
                </div>}
            </FormSection>
            { widget.widget && <React.Fragment>
                <label className="_label- __default-value">Default Value</label>
                <Field name={`${member}.data.value`} className="checkbox-default-value" currency={currency} configValue={configValue} component={widget.widget}/>
            </React.Fragment> }
        </React.Fragment>
    );
};


let PriceBreakdown = (props) => {
    const {inputs} = props;
    let widgets = props.services && props.services.widget && props.services.widget.reduce((acc, widget) => {
        acc[widget.type] = widget;
        return acc;
    }, {});

    let breakdown = inputs.reduce((acc, input) => {
        if (input.config && input.config.pricing && widgets[input.type].handler.priceHandler) {
            acc.push(<div>{input.prop_label} - {input.config.pricing.operation}
                - {widgets[input.type].handler.priceHandler(input.data, input.config)}</div>);
        }
        return acc;
    }, []);

    if (breakdown.length == 0) {
        breakdown = <React.Fragment/>
    }
    return (
        <React.Fragment>
            {breakdown}
        </React.Fragment>
    );
};
let WidgetList = props => (
    <Field name={props.name} id={props.name} component={selectField}
           className={`widget-list`}
           options={props.services.widget} valueKey="type" labelKey="label"
    />
);

WidgetList = consume("widget")(WidgetList);
PriceBreakdown = consume("widget")(PriceBreakdown);
RenderWidget = consume("widget")(RenderWidget);

export {RenderWidget, WidgetList, PriceBreakdown}