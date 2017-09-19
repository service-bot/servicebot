import React from "react";
import CurrencyInput from 'react-currency-input';

class WidgetPricingInput extends React.Component{

    constructor(props){
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e, maskedValue, floatvalue) {
            this.props.input.onChange(floatvalue);
    }

    render(){
        //renders a number input or a currency input based on the operation type
        let self = this;
        let props = this.props;
        let {operation} = props;

        if(operation == 'add' || operation == 'subtract'){
            return(
                <CurrencyInput {...props.input} className="form-control addon-checkbox-widget-price-input"
                               prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                               onChangeEvent={self.handleChange}
                />
            );
        }else if(operation == 'divide' || operation == 'multiply'){
            return(
                <CurrencyInput {...props.input} className="form-control addon-checkbox-widget-price-input"
                               decimalSeparator="." precision="0" suffix="%"
                               onChangeEvent={self.handleChange}
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