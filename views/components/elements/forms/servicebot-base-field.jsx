import React from 'react';
import CurrencyInput from 'react-currency-input';
import './css/servicebot-base-field.css';
import ReactTooltip from 'react-tooltip'
import dollarsToCents from 'dollars-to-cents';
import {toCents} from "../../../../lib/handleInputs"
// import CurrencyInput from 'react-currency-masked-input'
import {connect} from 'react-redux';
import getSymbolFromCurrency from 'currency-symbol-map'




let widgetField = props => {
    let {widget, label, type, meta: {touched, error, warning}} = props;
    let WidgetComponent = widget;

    return (
        <div className={`form-group form-group-flex`}>
            {(label && type !== 'hidden' && (type ==='text' || type === 'secure-string')) && <label className="control-label form-label-flex-md">{label}</label>}
            <div className="form-input-flex">
                <WidgetComponent
                    {...props}
                />
                {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span className="form-warning">{warning}</span>)) }
            </div>
        </div>
    )
};

let inputField = props => {
    let {input, placeholder, label, type, meta: {touched, error, warning}} = props;
    let autofocus = props && props.willAutoFocus;

    let formControlClass = `form-control ${touched && error && 'has-error'} ${touched && warning && 'has-warning'}`;

    let getInputField = (type)=>{
      switch(type){
          case 'textarea':
              return (
                  <textarea className={formControlClass} {...input} placeholder={label} autoFocus={autofocus}/>
              );
              break;
          case 'checkbox':
              return (
                  <input className={`${formControlClass} checkbox`} {...input} placeholder={label} type={type} autoFocus={autofocus}/>
              );
          default:
              return (
                  <input className={formControlClass} {...input} placeholder={placeholder || label} type={type} autoFocus={autofocus}/>
              )
      }
    };

    return(
        <div className={`form-group form-group-flex`}>
            {(label && type !== 'hidden') && <label className="control-label form-label-flex-md">{label}</label>}
            <div className="form-input-flex">
                {getInputField(type)}
                {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span className="form-warning">{warning}</span>)) }
            </div>
        </div>
    );
};


class selectField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount(){
        let {options, valueKey, input} = this.props;
        if(!input.value && options.length > 0){
            let value = valueKey ? options[0][valueKey] : options[0].id;
            input.onChange(value);

        }

    }
    componentDidUpdate(prevProps, prevState){
        let {options, valueKey, labelKey, defaultValue, input} = this.props;
        let self = this;
        //if there is a default value, set it, other wise, use the first option
        if((!input.value || !options.find(option =>option.id == input.value)) && options.length > 0 ){
            input.onChange(options[0].id);
        }
        else if(options.length == 0 && prevProps.options.length > 0){
            input.onChange(undefined);
        }
    }

    render() {
        let {input, label, type, options, valueKey, labelKey, meta: {touched, error, warning}} = this.props;
        return (
            <div className="form-group form-group-flex">
                {label && <label className="control-label form-label-flex-md">{label}</label>}
                <div className="form-input-flex">
                    <select className="form-control" {...input} placeholder={label}>
                        {options && options.map((option, index) =>
                            <option key={index} value={valueKey ? option[valueKey] : option.id}>
                                {labelKey ? option[labelKey] : option.name}
                            </option>
                        )
                        }
                    </select>
                    {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span className="form-warning">{warning}</span>))}
                </div>
            </div>
        );
    }
}

class OnOffToggleField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hover: false,
        };

        this.toggle = this.toggle.bind(this);
        this.hoverOn = this.hoverOn.bind(this);
        this.hoverOff = this.hoverOff.bind(this);
    }

    componentDidMount() {
        let initialValue = this.props.input.value || false;
        if(this.props.input.onChange) {
            this.props.input.onChange(initialValue);
        }

    }

    toggle(){
        if(this.props.input.onChange) {
            let newVal = !this.props.input.value;
            // this.props.setValue(newVal);
            this.props.input.onChange(newVal);
        }
    }

    hoverOn(){
        this.setState({hover:true});
    }
    hoverOff(){
        this.setState({hover:false});
    }

    render(){

        let { faIcon, icon, color, input, label, type} = this.props;
        let style = {};
        if( input.value === true){
            style = { ...style, color: "#ffffff", backgroundColor: color};
        }else if( this.state.hover ){
            style = { ...style, color: color, borderColor: color};
        }else{
            style = { ...style, color: "#dedede" };
        }

        return(
            <div className="form-group form-group-flex">
                {label && <label className="control-label form-label-flex-md">{label}</label>}
                <div style={input.disabled && ({"cursor" : "not-allowed"})} className={`iconToggleField slideToggle ${input.value && 'active'} ${!input.disabled && this.state.hover && 'hover'}`}
                     data-tip={label} onMouseEnter={this.hoverOn} onMouseLeave={this.hoverOff} onClick={this.toggle}>
                    <span style={style} className="itf-icon">
                        <i className={`fa fa-${faIcon || "check"}`}/>
                    </span>
                    {/*<ReactTooltip place="bottom" type="dark" effect="solid"/>*/}
                    <input className="hidden checkbox"
                           name={input.name}
                           value={input.value || false}
                           placeholder={label}
                           type={type || "checkbox"}/>
                </div>
            </div>
        )
    }
}

class iconToggleField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || this.props.defaultValue,
            hover: false,
        };

        this.toggle = this.toggle.bind(this);
        this.hoverOn = this.hoverOn.bind(this);
        this.hoverOff = this.hoverOff.bind(this);
    }

    toggle(){
        let newVal = !this.state.value;
        this.setState({value: newVal});
        this.props.setValue(newVal);
    }

    hoverOn(){
        this.setState({hover:true});
    }
    hoverOff(){
        this.setState({hover:false});
    }

    render(){

        let { faIcon, icon, color, input, input:{name, value, onChange}, label, type, meta: {touched, error, warning} } = this.props;
        let style = {};

        if( value == true || this.state.value == true ){
            style = { ...style, color: "#ffffff", backgroundColor: color};
        }else if( this.state.hover ){
            style = { ...style, color: color, borderColor: color};
        }else{
            style = { ...style, color: "#dedede" };
        }

        return(
            <div className={`iconToggleField ${value || this.state.value && 'active'} ${this.state.hover && 'hover'}`}
                 style={style} data-tip={label}
                 onMouseEnter={this.hoverOn} onMouseLeave={this.hoverOff}>
                <span className="itf-icon" onClick={this.toggle}>
                    <i className={`fa fa-${faIcon}`}/>
                </span>
                <ReactTooltip place="bottom" type="dark" effect="solid"/>
                <input className="hidden checkbox"
                       name={name}
                       value={value || this.state.value}
                       onChange={onChange}
                       placeholder={label}
                       type={type}/>
            </div>
        )
    }
}

class priceField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: "0.00"
        };
        this.handleChange = this.handleChange.bind(this);
    };

    handleChange(e, maskedValue, floatvalue) {
        let name = e.target.name;
        let self = this;
        let price = this.props.isCents ? toCents(floatvalue) : floatvalue;
        this.setState({[name]: price}, () => {
            self.props.input.onChange(self.state[name]);
        });
    }

    render() {
        let {options, isCents, input:{name, value, onChange}, label, type, meta: {touched, error, warning}} = this.props;
        let prefix = options.currency ? getSymbolFromCurrency(options.currency.value) : '';
        let price = isCents ?  (value/100).toFixed( 2 ) : value;
        return (
            <div className={`form-group form-group-flex`}>
                {label && <label className="control-label form-label-flex-md">{label}</label>}
                <div className="form-input-flex">
                    <CurrencyInput className="form-control" name={name}
                        prefix={prefix} decimalSeparator="." thousandSeparator="," precision="2"
                        onChangeEvent={this.handleChange} value={price}
                    />
                    {touched && ((error && <span className="form-error">{error}</span>) || (warning &&
                    <span className="form-warning">{warning}</span>))}
                </div>
            </div>
        );
    };
}
priceField = connect(state => {
    return {
        options: state.options,
    }
})(priceField);

export {inputField, widgetField, selectField, OnOffToggleField, iconToggleField, priceField};
