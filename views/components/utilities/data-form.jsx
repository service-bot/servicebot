import React from 'react';
import update from "immutability-helper";
import Fetcher from "./fetcher.jsx";
let _ = require("lodash");
var values = require('object.values');
import Load from "./load.jsx";

//todo: future this system can be cleaned up a ton, maybe a complete redo later
//todo: handle new data children default values
class DataChild extends React.Component {
    constructor(props){
        super(props);

    }
    componentWillUnmount(){
        this.props.handleDeleteChild();

    }
    render(){
        return <div>{this.props.children}</div>;
    }

}

DataChild.defaultProps = {
    isDataChild : true
}


class DataInput extends React.Component{
    constructor(props){
        super(props)

    }


    render() {
        return (
            <input
                name={this.props.name}
                value={this.props.value || this.props.defaultValue}
                onChange={this.props.onChange}
            />
        )
    }

}
DataInput.defaultProps = {
    receiveOnChange : true,
    receiveValue : true
}


class DataWysiwyg extends React.Component{
    constructor(props){
        super(props)


    }


    render() {
        return (
            <input
                name={this.props.name}
                value={this.props.value || this.props.defaultValue}
                onChange={this.props.onChange}
            />
        )
    }
}




class DataForm extends React.Component {
    constructor(props) {
        super(props);
        var initialState = { form : {references :{}}, errors: {}, ajaxLoad: false };
        this.state = this.stateGetter(props.children, null, null, initialState);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteChild = this.handleDeleteChild.bind(this);
        this.submitDataForm = this.submitDataForm.bind(this);
    }

    stateGetter(children, modelName, objectName, initial){
        let self = this;
        let initialChildren = initial.form.references;
        React.Children.forEach(children, function(child, index){
            let currModel = modelName;
            let currObject = objectName;

            if(child == null || child.props == null){
                return;
            }
            if(child.props.modelName){
                currModel = child.props.modelName || modelName;
                currObject = child.props.objectName || objectName;
            }

            //todo: fix dirty hack
            if(child.props.isDataChild){
                if(initialChildren[currModel] == null){
                    initialChildren[currModel] = {[currObject] : {}};
                }else{
                    initialChildren[currModel][currObject] = {};
                }
            }

            //if child is an input, select, textarea or any component with props.receiveOnCHange and props. receiveValue
            if((child.type=="input" || child.type=="select" || child.type =="textarea" ||
                (child.props && child.props.receiveOnChange && child.props.receiveValue)) && child.props.type != "submit"){

                const value = child.props.type === 'checkbox' ? (child.props.checked ||
                    child.props.defaultChecked) : (child.props.value || child.props.defaultValue);
                if(currModel && currObject) {
                    initialChildren[currModel][currObject][child.props.name] = value
                }else{
                    initial.form[child.props.name] = value;
                }

            }

            initial.form.references = initialChildren;
            if(child.props.children){
                initial = self.stateGetter(child.props.children, currModel, currObject, initial);
            }
        });
        return initial;


    }


    recursiveInputModifier(children, modelName, objectName){
        let self = this;

        return React.Children.map(children, function (child, index) {
            var childProps = {}
            var currentError = false;
            var currentWarning = false;

            if(child == null){
                return
            }

            //todo: flag elements that should have onChange attached to them (so we wont have a hardcoded type like wysiwyg)

            //if child is an input, select or a component with receiveOnChange = true
            if((child.type=="input" || child.type=="select" || (child.props && child.props.receiveOnChange)) && child.props.type != "submit"){

                //if child is a component and has props.receiveValue (Stop looking and do stuff)
                if(child.props && child.props.receiveValue){
                    let newProps = {};
                    let path = "";

                    if(modelName && objectName){
                        path = `references.${modelName}.${objectName}.${child.props.name}`;
                    }else{
                        path = `${child.props.name}`;
                    }

                    //checking to see if it has an error or warning
                    if(_.has(self.state.errors, path)){
                        if(_.has(self.state.errors, `${path}.error`)){
                            currentError = _.get(self.state.errors, `${path}.error`);
                        }else if(_.has(self.state.errors, `${path}.warning`)){
                            currentWarning = _.get(self.state.errors, `${path}.warning`);
                        }
                    }
                    //setting up the props for the component
                    newProps.onChange = self.handleInputChange(child, modelName, objectName);
                    newProps.value = _.get(self.state.form, path) || child.props.value || child.props.defaultValue;
                    newProps.error = currentError ? currentError : false;
                    newProps.className = currentError ? 'form-control has-error' : 'form-control';
                    newProps.warning = currentWarning ? currentWarning : false;

                    if(child.props.children){
                        newProps.children = self.recursiveInputModifier(child.props.children, modelName, objectName);
                    }

                    //returning the cloned element with the new props
                    return React.cloneElement(child, newProps);

                }else{ //otherwise, child is a regular input element

                    //making sure this element has a name then try and see if it has an error or warning
                    if(_.has(child.props, 'name')) {
                        if (Object.keys(self.state.errors).length > 0 && self.state.errors.constructor === Object) {
                            if (_.has(self.state.errors, child.props.name)) {
                                if(_.has(self.state.errors[child.props.name], 'error')){
                                    currentError = _.get(self.state.errors, child.props.name).error;
                                }else if(_.has(self.state.errors[child.props.name], 'warning')){
                                    currentWarning = _.get(self.state.errors, child.props.name).warning;
                                }
                            }
                        }
                    }

                    //setting up the props for the element
                    let newProps = {
                        onChange: self.handleInputChange(child, modelName, objectName),
                        'data-error' : currentError ? currentError : false,
                        className: currentError ? 'form-control has-error' : 'form-control',
                        'data-warning' : currentWarning ? currentWarning : false
                    };

                    //returning the cloned element with the new props
                    return React.cloneElement(child, newProps);
                }

            }else if(child.props){

                let currModel = child.props.modelName || modelName;
                let currObject = child.props.objectName || objectName;
                if(child.props.objectName){
                    childProps.handleDeleteChild = self.handleDeleteChild(currModel, currObject);
                }
                if(child.props.type == "submit"){
                    childProps.onClick = self.handleSubmit
                }
                childProps.children = self.recursiveInputModifier(child.props.children, currModel,currObject);
                return React.cloneElement(child, childProps);
            }

            return child;

        });
    }
    handleDeleteChild(modelName, objectName){
        let self = this;
        return function(){
            if(self.state.form.references[modelName]) {
                let newState = _.cloneDeep(self.state);
                delete newState.form.references[modelName][objectName];
                self.setState(newState);
            }
        }
    }

    handleSubmit(event){
        event.preventDefault();
        if(this.props.beforeSubmit){
            this.props.beforeSubmit(this.submitDataForm);
        }
        else{
            this.submitDataForm();
        }
    }

    submitDataForm(){
        let self = this;
        let form = self.state.form;
        let formChildren = form.references;
        let errors = {};

        //having validators is optional
        let validators = self.props.validators || false;
        if(validators){
            let childValidators = self.props.validators.references || false;

            //Validating dataForm inputs

            for (var prop in form){
                if(_.isFunction(validators[prop])) {
                    //validation functions will return true or an error object
                    let testResult = validators[prop](form[prop]);
                    if (testResult===true) {

                    } else {
                        _.set(errors, `${prop}`, {error: testResult.error});

                    }
                }
            }

            if(childValidators){
                //Validating dataChild inputs

                //accessing path formChild.references
                for (var model in formChildren){
                    //accessing path formChild.references[modelName]
                    for (var modelItem in formChildren[model]){
                        //accessing path formChild.references[modelName][fieldName]
                        for (var modelField in formChildren[model][modelItem]){
                            if(_.isFunction(childValidators[model][modelField])){
                                let testResult = childValidators[model][modelField](formChildren[model][modelItem][modelField]);
                                if(testResult===true){
                                }else{
                                    _.set(errors, `references.${model}.${modelItem}.${modelField}`, {error: testResult.error});
                                }
                            }else{
                                if(_.has(formChildren[model][modelItem], 'value')) {
                                    if (_.has(childValidators, model)) {
                                        if (_.has(childValidators[model], modelItem)) {
                                            if (_.isFunction(childValidators[model][modelItem].value)) {
                                                let theValidator = childValidators[model][modelItem].value;
                                                let theValue = formChildren[model][modelItem].value;
                                                let testResult = theValidator(theValue);
                                                if (testResult === true) {
                                                } else {
                                                    _.set(errors, `references.${model}.${modelItem}.value`, {error: testResult.error});
                                                }
                                            }
                                            // uncomment lines below to help in development to see the warning on fields.
                                            else {
                                                _.set(errors, `references.${model}.${modelItem}.${modelField}`, {warning: "no validation function defined"})
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        //if errors has objects in it, meaning have error in form
        if(Object.keys(errors).length > 0 && errors.constructor === Object){
            self.setState({errors: errors}, function () {
                if(self.props.onUpdate && _.isFunction(self.props.onUpdate)){
                    self.props.onUpdate(JSON.stringify(self.state));
                }
            });

        } else{ //otherwise, submit the form
            //Polyfill for object.values
            for(var model in formChildren ){
                formChildren[model] = values(formChildren[model]);
            }

            // set loading
            self.setState({ajaxLoad: true});

            form.references = formChildren;
            let method = self.props.method || "POST";
            Fetcher(self.props.url, method, form).then(function(result){
                self.setState({ajaxLoad: false});
                self.props.handleResponse(result);
            })
        }
    }
    handleInputChange(element, modelName=null, objectName=null) {
        let self = this;
        return function(event, newSet=null, nameOverride=null){
            let set = {form : { references: {}}};
            if(newSet && !event){
                return self.setState(currState => {
                    let newState = update(currState, newSet);
                    if(self.props.onUpdate) {
                        self.props.onUpdate(JSON.stringify(newState));
                    }
                    return newState;

                });

            }
            // const target = event.target;
            let value = "";
            let name = "";

                if(event && event.target) {
                    const target = event.target;
                    value = target.type === 'checkbox' ? target.checked : target.value;
                    name = target.name;
                    //if target doesn't exist - assume the event is the value
                }else{
                    value = event;
                    name = nameOverride ? nameOverride : element.props.name;
                }

            self.setState(currState => {

                if(modelName && objectName) {
                    if (!currState.form.references || currState.form.references[modelName] == null) {
                        set.form.references[modelName] = {$set: {[objectName]: {[name]: value}}};
                    } else if (currState.form.references[modelName][objectName] == null) {
                        set.form.references = {[modelName]: {[objectName] : {$set: {[name]: value}}}}
                    } else {
                        set.form.references = {[modelName] : {[objectName] : {[name] :{$set: value}}}}
                    }
                } else{
                    set.form[name] = {$set:value}
                }

                if(modelName && objectName) {
                    if(self.state.form.references[modelName] && self.state.form.references[modelName][objectName] && !currState.form.references[modelName][objectName]){
                        return currState;
                    }
                }

                const formState = update(currState, set);

                if(self.props.onUpdate) {
                    self.props.onUpdate(JSON.stringify(formState));
                }
                return formState;
            });
            //const formState = update(self.state, set);
            //self.setState(formState);
            // if(self.props.onUpdate) {
            //     self.props.onUpdate(JSON.stringify(formState));
            // }
            //
        }
    }

    render(){
        let children = this.recursiveInputModifier(this.props.children, null, null);

        return (
            <form id={this.props.id} className="dataform">
                {this.state.ajaxLoad && <Load/> }
                <div id="form-debug-json" className="alert alert-info" role="alert">
                    {JSON.stringify(this.state.form)}
                </div>
                {children}
            </form>
        );

    }

}


export  {DataForm, DataChild, DataInput};
