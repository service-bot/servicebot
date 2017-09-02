import React from "react";
import TagsInput from "react-tagsinput"
import handler from "./widgetHandler";

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

    handleChange(e){
        let name = e.currentTarget.name;
        let self = this;
        let value = e.currentTarget.value;
        this.setState({[name] : value}, () => {
            self.props.input.onChange(self.state);
        });
    }


    render(){
        let {input, configValue} = this.props;
        let self = this;
        console.log(configValue);
        return <div>
            {configValue && configValue.value && configValue.value.map((option, index) => (
                <div>
                <label>{option}</label>
                <input type="number" value={self.state[option]} name={option} key={index} onChange={self.handleChange}/>
            </div>))}
        </div>

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