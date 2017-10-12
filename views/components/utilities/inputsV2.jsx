import React from 'react';
import { TwitterPicker, SketchPicker } from 'react-color';
let _ = require("lodash");
let values = require('object.values');
const PropTypes = require('prop-types');


if(!Object.values){
    values.shim();
}


class Inputs extends React.Component {

    //TODO: make default value get set in dataform on mounting component
    constructor(props){
        super(props);
        this.state = {type: this.props.type, value: null};
        if(this.props.type == 'color_picker'){
            this.state = {
                type: this.props.type,
                name: this.props.name,
                colors: this.props.colors || ['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF'],
                value: this.props.defaultValue || this.props.value || null,
                showPicker: false,
                showCustomPicker: false
            }
        }

        this.handleChange = this.handleChange.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
        this.handleColorPickerChange = this.handleColorPickerChange.bind(this);
        this.handleShowPicker = this.handleShowPicker.bind(this);
        this.handleShowCustomPicker = this.handleShowCustomPicker.bind(this);
        this.clickInsideListener = this.clickInsideListener.bind(this);
    }

    componentDidMount(){
        this.context.initializeInput(this);
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.type == 'color_picker'){
            if(this.state.showPicker || this.state.showCustomPicker){
                document.addEventListener('click', this.clickInsideListener);
            }
        }if(this.props.onChange && this.props.formLess === true){
            this.props.onChange(null, this);
        }
    }

    componentWillUnmount(){
        if(this.state.type == 'color_picker'){
            document.removeEventListener('click', this.clickInsideListener);
        }
    }

    clickInsideListener(event){
        let self = this;
        let colorPickerElement = document.getElementById(`color_picker_${self.state.name}`);
        let isClickInside = colorPickerElement.contains(event.target);
        if (!isClickInside) {
            self.setState({showPicker: false, showCustomPicker: false});
        }
    }

    handleChange(e){
        this.context.handleInputsChange(e, this);
    }

    handlePriceChange(e){

        let self = this;
        let value = e.target.value || e.target.defaultValue;

        if(!isNaN(value)){
            if(value != '' && value != null) {
                self.setState({priceValue: (value / 100).toFixed(2)});
                this.props.onChange(e);
            }else if(value == 0){
                self.setState({priceValue: 0});
                let newEvent = e;
                newEvent.target.value = 0;
                this.props.onChange(newEvent);
            }else{
                self.setState({priceValue: 0});
                let newEvent = e;
                newEvent.target.value = null;
                this.props.onChange(newEvent);
            }
            self.setState({error: false});
        }else{
            let newEvent = e;
            newEvent.target.value = null;
            self.setState({error: 'Price must be a whole number.'})
        }
    }

    handleColorPickerChange(color, e){
        //change the color picker colors
        let currentColor = this.state.value;
        let currentColors = this.state.colors;
        let indexOfColor = _.indexOf(currentColors, _.toUpper(currentColor));
        if(indexOfColor){
            currentColors[indexOfColor] =  _.toUpper(color.hex);
        }

        this.setState({value: _.toUpper(color.hex), colors: currentColors, showPicker: false}, ()=>{
            let event = new Event('input', { bubbles: true });
            document.getElementById(`color_picker_${this.state.name}_input`).dispatchEvent(event);

            //remove event listener for clicking outside
            document.getElementById(`color_picker_${this.state.name}`).removeEventListener('click', this.clickInsideListener);
        });
    }
    handleShowPicker(){
        this.setState({showPicker: true});
    }
    handleShowCustomPicker(){
        this.setState({showCustomPicker: true});
    }

    render () {
        //initializing data
        const type          = this.state.type;
        let maxLength       = this.props.maxLength ? this.props.maxLength : false;
        let name            = this.props.name ? this.props.name : false;
        let label           = this.props.label ? this.props.label : false;
        let defaultValue    = this.props.value || this.props.defaultValue;
        let placeholder     = this.props.placeholder;
        let disabled        = this.props.disabled;
        let error           = this.props.errors && this.props.errors.length && this.props.errors[0].message || null;
        let warning         = this.props.warning ? this.props.warning : false;

        //error checking props
        if(!name){
            error = "Component requires a name passed in props.";
        }else if(!label && type != 'hidden'){
            error = "Component requires a label passed in props.";
        }

        if(type == "text" || type == "number" || type == "hidden"){
            return (
                <div className={`form-group ${error ? 'has-error' : ''} ${type == 'hidden' ? 'hidden' : ''}`}>
                    {label &&
                    <label className="control-label text-capitalize">{label}</label>
                    }
                    <input className="form-control"
                           maxLength={maxLength}
                           type={type}
                           placeholder={placeholder}
                           disabled={disabled}
                           name={name}
                           defaultValue={defaultValue}
                           onChange={this.handleChange}/>
                    {error && <span className="help-block">{error}</span> }
                </div>
            );
        }else if(type == "price"){
            //TODO: Handle on load, change the price mask for editing forms
            return(
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''} ${type == 'hidden' ? 'hidden' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <div className="price-input">
                        <span className="price-mask">{!isNaN(this.state.priceValue) && this.state.priceValue >= 0 ?
                            `$${this.state.priceValue}` : `$${this.props.value/100}`}</span>
                        <input className="form-control price-value" autoComplete="off" maxLength={maxLength} type="number" placeholder={placeholder}
                               disabled={disabled} name={name} defaultValue={defaultValue || 0} onChange={this.handlePriceChange}/>
                    </div>
                    {error && <span className="help-block">{error}</span> }
                </div>
            )
        }else if(type == "textarea"){
            let row  = this.props.row? this.props.row : 4;
            return (
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <textarea className="form-control" name={name} defaultValue={defaultValue} rows={row} onChange={this.handleChange}/>
                    {error && <span className="help-block">{error}</span> }
                </div>
            )
        }else if(type == "select"){
            return (
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <select className="form-control" disabled={disabled} defaultValue={defaultValue} name={name} onChange={this.handleChange}>
                        {this.props.value == null && defaultValue == null ?
                            <option value={null}>{''}</option> : ''
                        }
                        {(_.isArray(this.props.options) && this.props.options) ?
                            this.props.options.map( option => (
                                <option key={`option-${typeof(option) == 'object' ? Object.keys(option)[0] : option}`}
                                        value={typeof(option) == 'object' ? Object.values(option)[0] : option}>
                                    {typeof(option) == 'object' ? Object.keys(option)[0] : option}</option>
                            )) :
                            <span className="help-block">Options format is not accepted. Must be an array or array of objects</span>
                        }
                    </select>
                    {error && <span className="help-block">{error}</span> }
                </div>
            );
        }else if(type == "bool" || type == "boolean") {

            return (
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <select className="form-control" disabled={disabled} defaultValue={defaultValue} name={name} onChange={this.handleChange}>
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                    </select>
                    {error && <span className="help-block">{error}</span> }
                </div>
            );

        }else if(type == "checkbox"){
            return (
                <div className={`form-group ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label">{label}</label>}
                    <input className="form-control" type={type} name={this.props.name} defaultChecked={this.props.defaultValue == 'true'} onChange={this.handleChange}/>
                    {this.props.error && <span className="help-block">{this.props.error}</span> }
                </div>
            );
        }else if(type == "color_picker"){

            console.log("color picker color:", this.state.value);
            return (
                <div key={`color_picker_${this.state.name}`} id={`color_picker_${this.state.name}`}
                     className={`form-group color-picker-input ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <div className="ColorPickerPreview"
                         style={{backgroundColor: this.state.value, width: 50+'px', height: 50+'px', cursor: 'pointer', borderRadius: 5+'px'}}
                         onClick={this.handleShowPicker}/>
                    <span className="custom-color-picker" onClick={this.handleShowCustomPicker}><i className="fa fa-edit"/></span>
                    <input id={`color_picker_${this.state.name}_input`} className="form-control"
                           type="text" name={this.state.name} style={{display: 'none'}}
                           value={this.state.value} onFocus={this.handleShowPicker} onChange={this.props.onChange}/>
                    { this.state.showPicker &&
                    <TwitterPicker color={{color: {hex: this.state.value}}} colors={this.state.colors}
                                   onChange={this.handleColorPickerChange}/>
                    }
                    { this.state.showCustomPicker &&
                    <SketchPicker color={{color: {hex: this.state.value}}} colors={this.state.colors}
                                  onChange={this.handleColorPickerChange}/>
                    }
                    {this.props.error && <span className="help-block">{this.props.error}</span> }
                    <div className="clearfix"/>
                </div>
            );
        }
        return( <p>Error: Check your Inputs type</p> );
    }

}

Inputs.contextTypes = {
    formName: PropTypes.string,
    handleInputsChange : PropTypes.func,
    initializeInput : PropTypes.func
};



export default Inputs;
