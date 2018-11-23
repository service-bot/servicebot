import React from "react";
import TagsInput from "react-tagsinput"

//todo: all the imports from the main app will result in duplicate code.... need to fix this!
import handler from "./widgetHandler";
import WidgetPricingInput from '../../../views/components/utilities/widget-inputs/WidgetPricingInput.jsx';
import {adjust} from '../../../views/components/utilities/widget-inputs/WidgetPriceAdjustment';


let Tags = (props) => {
    return (
        <div className="sb-form-group __addon-options-widget-config">
            <label className="_label-">Available Options</label>
            <TagsInput className="_input- react-tagsinput"
                       inputProps={{placeholder: 'Add Options'}} {...props.input} value={props.input.value || []}/>
        </div>
    );
};

class SelectPricing extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handlePercentPriceChange = this.handlePercentPriceChange.bind(this);
        this.state = (props.configValue && props.configValue.pricing && typeof props.configValue.pricing.value === 'object') ? props.configValue.pricing.value : {};
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (this.props.configValue.value && prevProps.configValue && prevProps.configValue.value && prevProps.configValue.value.length > this.props.configValue.value.length) {
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

    handleChange(name) {
        let self = this;
        return function (floatvalue){
            self.setState({[name]: floatvalue}, () => {
                self.props.input.onChange(self.state);
            });
        }
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
        let operation = configValue && configValue.pricing && configValue.pricing.operation;
        let pricingValue = configValue && configValue.pricing && configValue.pricing.value;
        return (
            <div className={`addon-options-widget-price-inputs-wrapper`}>
                {configValue ? configValue.value && configValue.value.map((option, index) => {
                    let input = {
                        onChange : self.handleChange(option),
                        name : option,
                        value :  (pricingValue && pricingValue[option]) || 0
                    };

                    return (<div>{option} : <WidgetPricingInput input={input} operation={operation}/></div>);
                }):
                    <span className="addon-widget-price-tip">Add some available options above</span>
                }
            </div>
        );
    }
}

let SelectWidget = (props) => {
    let {input, configValue, label} = props;
    return (
        <div className="sb-form-group __addon-options-widget">
            {label && <label className="_label-">{label}</label>}
            <div className="form-input-flex">
                <select className="_input- __input-addon-options-widget" {...input}>
                    <option value="" key="0-default">Choose One</option>
                    { configValue && configValue.value && configValue.value.map((option, index) => {
                            let price = configValue.pricing && configValue.pricing.value && configValue.pricing.value[option];
                            return <option key={index} value={option}>
                                {(price && configValue.pricing.operation) ? `${option}: ${adjust(configValue.pricing.operation, price)}` : `${option}`}
                            </option>
                        }
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