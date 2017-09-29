import React from "react";
import CurrencyInput from 'react-currency-input';

class WidgetPricingInput extends React.Component{

    constructor(props){
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e, maskedValue, floatvalue) {
        let name = e.target.name;
        let self = this;
        this.setState({[name]: floatvalue}, () => {
            self.props.input.onChange(self.state[name]);
        });
    }

    render(){
        //renders a number input or a currency input based on the operation type
        let self = this;
        let props = this.props;
        let {operation, input: {name, value, onChange}} = props;

        if(operation == 'add' || operation == 'subtract'){
            return(
                <CurrencyInput className="form-control addon-checkbox-widget-price-input" name={name}
                                prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                                onChangeEvent={this.handleChange} value={value}
                />
            );
        }else if(operation == 'divide' || operation == 'multiply'){
            return(
                <CurrencyInput className="form-control addon-checkbox-widget-price-input" name={name}
                               decimalSeparator="." precision="0" suffix="%"
                               onChangeEvent={this.handleChange} value={value}
                />
                // <input {...props.input} type="number" className="form-control addon-checkbox-widget-price-input"/>
            );
        }else{
            return(
                <span className="addon-widget-price-tip">Select a pricing type</span>
            )
        }

    }
}

export default WidgetPricingInput;