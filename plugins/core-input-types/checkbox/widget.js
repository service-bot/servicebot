import React from "react";
import handler from "./widgetHandler";
import CurrencyInput from 'react-currency-input';
import PriceAdjustment from '../../../views/components/utilities/widget-inputs/WidgetPriceAdjustment';
import WidgetPricingInput from '../../../views/components/utilities/widget-inputs/WidgetPricingInput.jsx';
import {OnOffToggleField} from "../../../views/components/elements/forms/servicebot-base-field.jsx";
let Checkbox = (props) => {
    let {input, configValue, label} = props;
    return (
        <div className={`addon-checkbox-widget-default-value-wrapper`}>
            <div className="form-group form-group-flex addon-checkbox-widget-default-value">
                {label && <label className="control-label form-label-flex-md addon-checkbox-widget-default-value-label">{label}</label>}
                <div className="form-input-flex">
                    <div className="request-form-toggle-option-wrapper">
                    <OnOffToggleField faIcon="check" color="#0091EA" input={input} type="checkbox"/>
                    {configValue && configValue.pricing && configValue.pricing.value && <PriceAdjustment price={configValue.pricing.value} operation={configValue.pricing.operation}/>}
                    </div>
                    {/*<input className="form-control addon-checkbox-widget-default-value-input" {...props.input} type="checkbox"/>*/}
                </div>
            </div>
        </div>
    );
};
let Price = (props) => {
    let config = props.configValue;
    return (
        <div className={`addon-checkbox-widget-price-inputs-wrapper`}>
            <div className="form-group form-group-flex checkbox-checkbox-widget-price-inputs">
                <WidgetPricingInput input={props.input} operation={config && config.pricing && config.pricing.operation}/>
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