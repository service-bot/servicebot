import React from "react";
import TagsInput from "react-tagsinput"
import {priceField} from "../../views/components/elements/forms/servicebot-base-field.jsx";
import handler from "./widgetHandler";
import CurrencyInput from 'react-currency-input';

let Tags = (props) => {
    return (
        <div className="form-group form-group-flex addon-options-widget-config-input-wrapper">
            <label className="control-label form-label-flex-md addon-options-widget-config-input-label">Available Options</label>
            <div className="form-input-flex">
                <TagsInput className="addon-options-widget-config-input react-tagsinput"
                    inputProps={{placeholder: 'Add Options'}} {...props.input} value={props.input.value || []}/>
            </div>
        </div>
    );
};

class SelectPricing extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handlePercentPriceChange = this.handlePercentPriceChange.bind(this);
        this.state = (props.configValue && props.configValue.pricing) ? props.configValue.pricing.value : {};
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (prevProps.configValue && prevProps.configValue.value && prevProps.configValue.value.length > this.props.configValue.value.length) {
            let propsToRemove = prevProps.configValue.value.filter(prop => self.props.configValue.value.indexOf(prop) < 0);
            let newState = propsToRemove.reduce((acc, prop) => {
                acc[prop] = undefined;
                return acc;
            }, {});
            this.setState(newState, () => {
                self.props.input.onChange(self.state);
            });
        }

    }

    handleChange(e, maskedValue, floatvalue) {
        let name = e.target.name;
        let self = this;
        this.setState({[name]: floatvalue}, () => {
            self.props.input.onChange(self.state);
        });
    }

    handlePercentPriceChange(e, maskedValue, floatvalue){
        let name = e.target.name;
        let self = this;
        this.setState({[name]: floatvalue}, () => {
            self.props.input.onChange(self.state);
        });
    }

    render() {
        let {input, configValue} = this.props;
        let self = this;
        console.log("selectPrice config value", configValue);
        return (
            <div className={`addon-options-widget-price-inputs-wrapper`}>
                {configValue ? configValue.value && configValue.value.map((option, index) => (
                    <div className="form-group form-group-flex addon-options-widget-price-inputs">
                        <label
                            className="control-label form-label-flex-md addon-options-widget-price-input-label">{option}</label>
                        {configValue.operation && (configValue.operation == "add" || configValue.operation == "subtract") ?
                            <CurrencyInput className="form-control addon-options-widget-price-input"
                                           value={self.state[option] || (configValue.pricing && configValue.pricing.value ) && configValue.pricing.value[option]} name={option} key={index}
                                           prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                                           onChangeEvent={self.handleChange}
                            /> :
                            <CurrencyInput className="form-control addon-checkbox-widget-price-input"
                                           value={self.state[option] || configValue.pricing.value[option]} name={option} key={index}
                                           decimalSeparator="." precision="0" suffix="%"
                                           onChangeEvent={self.handlePercentPriceChange}/>
                        }
                    </div>
                )):
                    <span className="addon-widget-price-tip">Add some available options above</span>
                }
            </div>
        );
    }
}

let SelectWidget = (props) => {
    let {input, configValue} = props;
    return (
        <div className="form-group form-group-flex addon-options-widget-default-value-wrapper">
            <label className="control-label form-label-flex-md addon-options-widget-default-value-label">Set Default Value</label>
            <div className="form-input-flex">
                <select className="form-control addon-options-widget-default-value-select" {...input}>
                    <option value="">Choose One</option>
                    { configValue && configValue.value && configValue.value.map((option, index) =>
                        <option key={index} value={option}>{option}</option>
                    )}
                </select>
            </div>
        </div>
    )
};


let widget = {
    widget: SelectWidget,
    type: "select",
    label: "Select",
    config: Tags,
    pricing: SelectPricing,
    handler: handler
};

export default widget