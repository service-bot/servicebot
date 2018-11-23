import React from "react";
import handler from "./widgetHandler";
import PriceAdjustment from '../../../views/components/utilities/widget-inputs/WidgetPriceAdjustment';
import WidgetPricingInput from '../../../views/components/utilities/widget-inputs/WidgetPricingInput.jsx';
import {OnOffToggleField} from "servicebot-base-form";
let Checkbox = (props) => {
    let {input, configValue, label, currency} = props;
     console.log(currency, "CHECKCURR");
    return (
        <div className="addon-widget-checkbox __default-value">
            {label && <label className="_label- addon-checkbox-widget-default-value-label">{label}</label>}
            <OnOffToggleField input={input} type="checkbox" className={`addon-widget`}>
                {configValue && configValue.pricing && configValue.pricing.value && <PriceAdjustment currency={currency} price={configValue.pricing.value} operation={configValue.pricing.operation}/>}
            </OnOffToggleField>
        </div>
    );
};
let Price = (props) => {
    let config = props.configValue;
    return (
        <div className={`addon-checkbox-widget-price-inputs-wrapper`}>
            <div className="checkbox-checkbox-widget-price-inputs">
                <WidgetPricingInput currency={props.currency} input={props.input} operation={config && config.pricing && config.pricing.operation}/>
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