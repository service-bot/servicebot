import React from "react";
import handler from "./widgetHandler";
import CurrencyInput from 'react-currency-input';
import WidgetPricingInput from '../../views/components/utilities/WidgetPricingInput.jsx';
import {OnOffToggleField} from "../../views/components/elements/forms/servicebot-base-field.jsx";
let Checkbox = (props) => {
    console.log("checkbox props", props);
    return (
        <div className={`addon-checkbox-widget-default-value-wrapper`}>
            <div className="form-group form-group-flex addon-checkbox-widget-default-value">
                <label className="control-label form-label-flex-md addon-checkbox-widget-default-value-label">Set Default Value</label>
                <div className="form-input-flex">
                    <OnOffToggleField faIcon="check" color="#0091EA" input={props.input} type="checkbox"/>
                    {/*<input className="form-control addon-checkbox-widget-default-value-input" {...props.input} type="checkbox"/>*/}
                </div>
            </div>
        </div>
    );
};
let Price = (props) => {
    return (
        <div className={`addon-checkbox-widget-price-inputs-wrapper`}>
            <div className="form-group form-group-flex checkbox-checkbox-widget-price-inputs">
                <WidgetPricingInput input={props.input} operation={props. configValue && props.configValue.operation}/>
                {/*<CurrencyInput {...props.input} className="form-control addon-checkbox-widget-price-input"*/}
                               {/*prefix="$" decimalSeparator="." thousandSeparator="," precision="2"*/}
                {/*/>*/}
            </div>
        </div>
    );
};

let widget = {
    widget : Checkbox,
    type : "checkbox",
    label : "Checkbox",
    pricing: Price,
    handler : handler
};


export default widget