import React from 'react';
import CurrencyInput from 'react-currency-input';
import './css/servicebot-base-field.css';
import ReactTooltip from 'react-tooltip'
import dollarsToCents from 'dollars-to-cents';
// import CurrencyInput from 'react-currency-masked-input'

const inputField = ({input, placeholder, label, type, meta: {touched, error, warning}}) => (
    <div className={`form-group form-group-flex`}>
        {label && <label className="control-label form-label-flex-md">{label}</label>}
        <div className="form-input-flex">
            {type === "textarea" && <textarea className="form-control" {...input} placeholder={label}/> }
            {(type === "text" || type === "number") && <input className="form-control" {...input} placeholder={placeholder || label} type={type}/> }
            {type === "checkbox" && <input className="form-control checkbox" {...input} placeholder={label} type={type}/> }
            {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>)) }
        </div>
    </div>
);

class selectField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
/*    componentDidMount(){
        let {options, defaultValue} = this.props;
        let self = this;
        this.props.input.onChange(options[0]);

    }*/
    componentDidUpdate(prevProps, prevState){
        let {options, defaultValue, input} = this.props;
        let self = this;
        console.log("IOTIONS", options);
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
                    {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>))}
                </div>
            </div>
        );
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
        console.log(this.state);
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
        console.log("icon toggle .props", this.props);

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
            amount: "0.00",
            amountInCents: 0,
            maskedAmount: "$0.00",
        };
        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount(){
        let {input:{name, value, onChange}, label, type, meta: {touched, error, warning}} = this.props;

        if(value){
            console.log("mounted with value", value, "converting to", value/100);
            this.setState({value: value/100});
        }else{
            console.log("mounted without value", value);
        }
    };

    handleChange(event, maskedValue, floatValue){
        this.setState(
            {
                amount: floatValue,
                amountInCents: floatValue * 100,
                value: floatValue,
                maskedAmount: maskedValue,
            });
    };

    render() {
        let {input:{name, value, onChange}, label, type, meta: {touched, error, warning}} = this.props;
        // console.log("Price Input", input);
        console.log("the value", value);
        return (
            <div className={`form-group form-group-flex`}>
                {label && <label className="control-label form-label-flex-md">{label}</label>}
                <div className="form-input-flex">
                    <CurrencyInput className="form-control" name={name} onChange={onChange}
                        prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                        onChangeEvent={this.handleChange} value={this.state.value || value}
                    />
                    {touched && ((error && <span className="form-error">{error}</span>) || (warning &&
                    <span>{warning}</span>))}
                </div>
            </div>
        );
    };
}

// class priceField extends React.Component {
//
//     constructor(props){
//         super(props);
//
//         this.onChange = this.onChange.bind(this);
//     }
//
//     onChange(e){
//         console.log("my price value", e.target.value);
//         this.props.input.onChange(e);
//     }
//
//     render(){
//
//         let {input, input:{name, value, onChange} , label, type, meta: {touched, error, warning}} = this.props;
//
//         return(
//             <CurrencyInput refs="mypriceinput" className="form-control" defaultValue={value} name={name} onChange={this.onChange}/>
//         );
//
//     }
// }


export {inputField, selectField, iconToggleField, priceField};