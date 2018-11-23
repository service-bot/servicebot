import React from "react";
import NumberFormat from 'react-number-format';
import {toCents} from "../../../../lib/handleInputs";
import {connect} from 'react-redux';

class WidgetPricingInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(isCents) {
        let self = this;
        return function ({value}, e) {
            let name = e.target.name;
            let parsedValue = isCents ? toCents(value) : value;
            self.setState({[name]: parsedValue}, () => {
                self.props.input.onChange(self.state[name]);
            });
        }
    };

    render() {
        //renders a number input or a currency input based on the operation type
        let self = this;
        let props = this.props;
        let {options, currency, operation, input: {name, value, onChange}} = props;

        if (operation == 'add' || operation == 'subtract') {
            let price = (value / 100)
            let formatParts = Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency || (options.currency && options.currency.value) || "USD"
            }).formatToParts(Number(price));
            let prefix = formatParts[1].type === "literal" ? formatParts[0].value + formatParts[1].value : formatParts[0].value;

            return (
                <NumberFormat className="_input- addon-checkbox-widget-price-input" name={name}
                              prefix={prefix} decimalSeparator="." thousandSeparator="," decimalScale="2"
                              allowNegative={false}
                              fixedDecimalScale={false}
                              onValueChange={this.handleChange(true)} value={price}
                />
            );
        } else if (operation == 'divide' || operation == 'multiply') {
            return (
                <NumberFormat className="_input- addon-checkbox-widget-price-input" name={name}
                              decimalSeparator="." decimalScale={0} suffix="%" allowNegative={false}
                              onValueChange={this.handleChange(false)} value={value}
                />
                // <input {...props.input} type="number" className="form-control addon-checkbox-widget-price-input"/>
            );
        } else {
            return (
                <span className="addon-widget-price-tip">Select a pricing type</span>
            )
        }

    }
}

let mapStateToProps = state => {
    return {
        options: state.options,
    }
};
export default connect(mapStateToProps)(WidgetPricingInput);