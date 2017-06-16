import React from 'react';
import { TwitterPicker, SketchPicker } from 'react-color';
let _ = require("lodash");
let values = require('object.values');

if(!Object.values){
    values.shim();
}
class Inputs extends React.Component {

    //TODO: make default value get set in dataform on mounting component
    constructor(props){
        super(props);
        this.state = {type: this.props.type, value: null};
        if(this.props.type == 'creditcard'){
            this.state = {  type: this.props.type,
                            value: this.props.defaultValue || this.props.value || null,
                            cardParts: ['','','',''], card: '',
                            priceValue: 0};
        }else if(this.props.type == 'color_picker'){
            this.state = {
                type: this.props.type,
                name: this.props.name,
                colors: this.props.colors || ['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF'],
                value: this.props.defaultValue || this.props.value || null,
                showPicker: false,
                showCustomPicker: false
            }
        }

        this.manageDependency = this.manageDependency.bind(this);
        this.renderChildren = this.renderChildren.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
        this.handleColorPickerChange = this.handleColorPickerChange.bind(this);
        this.handleShowPicker = this.handleShowPicker.bind(this);
        this.handleShowCustomPicker = this.handleShowCustomPicker.bind(this);
        this.clickInsideListener = this.clickInsideListener.bind(this);
        //helpers
        this.onEnterCreditCard = this.onEnterCreditCard.bind(this);
        this.getCardParts = this.getCardParts.bind(this);
    }
    componentDidMount(){
        let self = this;

        if(this.props.onChange && this.props.receiveOnChange === true){
            this.props.onChange(this.props.defaultValue || this.props.value);
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.type == 'color_picker'){
            if(this.state.showPicker || this.state.showCustomPicker){
                document.addEventListener('click', this.clickInsideListener);
            }
        }
    }

    componentWillUnmount(){
        if(this.props.onChange && this.props.unmountValue != null){
            this.props.onChange(this.props.unmountValue.toString());
        }

        if(this.state.type == 'color_picker'){
            console.log("trying to remove listener on unmount");
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

    //process dependency
    manageDependency(){
        let self = this;
        let dependencies = this.props.manageDependency;
        if(dependencies) {
            return React.Children.map(self.props.children, child => {
                  let newProps = dependencies.map(dep =>{
                    if(child.props.name == dep.dependsOn){
                        let dependentChild = React.Children.map(self.props.children, child =>{if(child.props.name == dep.name){return child}})[0]
                        return {dependentFunction: dep.valFun, dependent: dependentChild};
                    }
                })[0];
                  if(newProps){
                      return React.cloneElement(child, newProps)
                  }
                  else{
                      return child;
                  }
            });
        }
    }

    //filters children based on the this component's props' filter function's result.
    //will show child elements based on parent value.
    renderChildren(parentValue) {
        let myChildren = this.props.children;
        if(this.props.manageDependency){
            myChildren = this.manageDependency();
        }
        if(this.props.filter){
            return React.Children.toArray(myChildren).filter(this.props.filter(parentValue.toString()));
        }
        return myChildren;
    }

    handleChange(e){
        // console.log("input event: ", e);

        let value = e.target.value || e.target.defaultValue;
        if(this.props.dependentFunction){
            this.props.dependentFunction(value, this.props.dependent);
        }

        this.props.onChange(e);
        // this.setState({value: value});
    }

    handlePriceChange(e){
        console.log("handlePriceChange", e);
        let self = this;
        let value = e.target.value || e.target.defaultValue;

        if(!isNaN(value)){
            if(value > 0.01 && value != '' && value != null) {
                self.setState({priceValue: (value / 100).toFixed(2)});
                this.props.onChange(e);
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
        console.log(color);

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
        let disabled        = this.props.disabled ? true : false;
        let error           = this.props.error ? this.props.error : this.state.error ? this.state.error : false;
        let warning         = this.props.warning ? this.props.warning : false;

        //error checking props
        if(!name){
            error = "Component requires a name passed in props.";
        }else if(!label && type != 'hidden'){
            error = "Component requires a label passed in props.";
        }

        if(type == "text" || type == "number" || type == "hidden"){
            console.log("passed in value", defaultValue);
            return (
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''} ${type == 'hidden' ? 'hidden' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <input className="form-control" maxLength={maxLength} type={type} placeholder={placeholder}
                           disabled={disabled} name={name} defaultValue={defaultValue} onChange={this.props.onChange}/>
                    {error && <span className="help-block">{error}</span> }
                    {warning && <span className="help-block">{warning}</span> }
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
                               disabled={disabled} name={name} defaultValue={defaultValue} onChange={this.handlePriceChange}/>
                    </div>
                    {error && <span className="help-block">{error}</span> }
                    {warning && <span className="help-block">{warning}</span> }
                </div>
            )
        }else if(type == "textarea"){
            let row  = this.props.row? this.props.row : 4;
            return (
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label text-capitalize">{label}</label>}
                    <textarea className="form-control" name={name} defaultValue={defaultValue} rows={row} onChange={this.props.onChange}/>
                    {error && <span className="help-block">{error}</span> }
                    {warning && <span className="help-block">{warning}</span> }
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
                    {warning && <span className="help-block">{warning}</span> }
                    {this.renderChildren(this.props.value || defaultValue)}
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
                    {warning && <span className="help-block">{warning}</span> }
                </div>
            );

        }else if(type == "checkbox"){
            return (
                <div className={`form-group ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label">{label}</label>}
                    <input className="form-control" type={type} name={this.props.name} defaultChecked={this.props.defaultValue == 'true'} onChange={this.props.onChange}/>
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
        }else if(type =="creditcard"){
            console.log('creditcard input name', name);
            return(
                <div className={`form-group ${warning ? 'has-warning' : ''} ${error ? 'has-error' : ''}`}>
                    {label && <label className="control-label">{label}</label>}
                    <input className="form-control" type="text" name={name} value={this.getCardParts()} maxLength="16" onChange={this.props.onChange}/>
                    <div className="row">
                        <div className="col-xs-3"><input className="form-control" type="number" id='card0' maxLength="4" value={this.state.cardParts[0]} onChange={this.onEnterCreditCard}/></div>
                        <div className="col-xs-3"><input className="form-control" type="number" id='card1' maxLength="4" value={this.state.cardParts[1]} onChange={this.onEnterCreditCard}/></div>
                        <div className="col-xs-3"><input className="form-control" type="number" id='card2' maxLength="4" value={this.state.cardParts[2]} onChange={this.onEnterCreditCard}/></div>
                        <div className="col-xs-3"><input className="form-control" type="number" id='card3' maxLength="4" value={this.state.cardParts[3]} onChange={this.onEnterCreditCard}/></div>
                    </div>
                </div>
            );
        }

        return( <p>Error: Check your Inputs type</p> );
    }

    //helper functions
    onEnterCreditCard(event){
        let index = parseInt(event.target.id.slice(-1));
        let myCardParts = this.state.cardParts;
        let val = event.target.value.toString();
        if(val >= 0){
            if(myCardParts[index].length < 4) {
                myCardParts[index] = val;
                this.setState({cardParts: myCardParts});
            }else{
                if(val.length < myCardParts[index].length){
                    myCardParts[index] = val;
                    this.setState({cardParts: myCardParts});
                }
            }
        }
    }
    getCardParts(){
        if(this.state.cardParts) {
            let cardParts = this.state.cardParts;
            return cardParts[0] + cardParts[1] + cardParts[2] + cardParts[3];
        }
        return '';
    }
}

export default Inputs;
