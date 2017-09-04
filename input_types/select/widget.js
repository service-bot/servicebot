import React from "react";
import TagsInput from "react-tagsinput"
import {priceField} from "../../views/components/elements/forms/servicebot-base-field.jsx";
import handler from "./widgetHandler";
import CurrencyInput from 'react-currency-input';

let Tags = (props) => {
    return  <TagsInput  {...props.input} value={props.input.value || []}/>
};

class SelectPricing extends React.Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {};


    }
    componentDidUpdate(prevProps, prevState){
        let self = this;
        if(prevProps.configValue && prevProps.configValue.value && prevProps.configValue.value.length > this.props.configValue.value.length){
            let propsToRemove = prevProps.configValue.value.filter(prop => self.props.configValue.value.indexOf(prop) < 0);
            let newState = propsToRemove.reduce((acc, prop) => {
                acc[prop] = undefined;
                return acc;
            }, {})
            this.setState(newState, () => {
                self.props.input.onChange(self.state);
            });
        }
    }

    handleChange(e, maskedValue, floatvalue){
        let name = e.target.name;
        let self = this;
        this.setState({[name] : floatvalue}, () => {
            self.props.input.onChange(self.state);
        });
    }


    render(){
        let {input, configValue} = this.props;
        let self = this;
        console.log(configValue);
        return (
            <div className={`form-group form-group-flex`}>
                {configValue && configValue.value && configValue.value.map((option, index) => (
                    <div>
                        <label className="control-label form-label-flex-md">{option}</label>
                        <CurrencyInput className="form-control" value={self.state[option]} name={option} key={index}
                                       prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                                       onChangeEvent={self.handleChange}
                        />
                    </div>
                ))}
            </div>
        );
    }
}

let SelectWidget = (props) => {
    let {input, configValue} = props;
    return (<select {...input}>
        <option value=""/>
        { configValue && configValue.value && configValue.value.map((option, index) =>  <option key={index} value={option}>{option}</option>)}
    </select>)
};


let widget = {widget : SelectWidget, type : "select", label : "Select", config : Tags, pricing : SelectPricing, handler : handler };



export default widget