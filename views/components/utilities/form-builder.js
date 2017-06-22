import { setFormData } from "./actions";
import { connect } from 'react-redux';
import _ from "lodash";
import update from 'immutability-helper';
import React from 'react';
import PropTypes from 'prop-types';


function handleValidation(stateFormData, newFormData = null, refModel = null, refIndex = null){

    let self = this;
    let errors = false;
    let currentDataset = stateFormData;
    let formData = newFormData || stateFormData;
    if(refModel === null && refIndex === null){
        formData = update(formData, { "hasErrors": {$set: false} });
    }
    if(currentDataset.validators && currentDataset.validators.length) {
        currentDataset.validators.map((validator) => {
            let key = Object.keys(validator)[0];
            let result = typeof(validator[key]) === "function" ? validator[key](currentDataset[key]) : true;
            if (result !== true) {
                errors = true;
                if(refModel === null && refIndex === null) {
                    formData = update(formData, { "errors": { $set: [{ "field": key, "message": result }] } });
                }else{
                    formData = update(formData, { "references" : { [refModel] : { [refIndex]: { "errors": { $set: [{ "field": key, "message": result }] } } } } });
                    return(formData);
                }
            }else{ //the error is corrected, remove item from the error object
                if(refModel === null && refIndex === null) {
                    let filteredErrors = _.filter(formData.errors, (obj)=>{ return obj.field != key });
                    formData = update(formData, { "errors": {$set: filteredErrors} });
                }else{
                    let filteredErrors = _.filter(currentDataset.errors, (obj)=>{ return obj.field != key });
                    formData = update(formData, { "references" : { [refModel] : { [refIndex]: { "errors": { $set: filteredErrors } } } } });
                    return(formData);
                }
            }
        });
        if(currentDataset.references && Object.keys(currentDataset.references).length){
            _.map(currentDataset.references, (refModel, key)=>{
                refModel.map((refField, index)=>{
                    formData = self.handleValidation(refField, formData, key, index);
                });
            });
        }
    }
    if(errors){
        formData = update(formData, { "hasErrors": {$set: true} });
    }
    return formData;
}



let mapStateToProps = function(name){

    return function(state, ownProps){
        console.log(state.allForms);
        return {"formData" : state.allForms[name]}
    }
};





let mapDispatchToProps = function(name){
    return (dispatch, ownProps) => {
        return {
            setFormData: (newFormData) => {
                dispatch(setFormData(name, newFormData))
            },
            validateForm: () => {
                let validatedForm = handleValidation(ownProps.formData)
                dispatch(setFormData(name, validatedForm));
                return validatedForm;
            }
        }
    }
};

let buildFormData = function(name, value, formData, refName = null, refID = null, validator = null){
    console.log("DATA", formData);
    if(refName && refID){


        console.log("updating formData for references");
        let refIndex = _.findIndex(formData.references[refName], ['id', refID]);
        const newData = update(this.state.formData, {
            references: { [refName]:{ [refIndex]:{ [name]: {$set: value}, "validators": {$set: [{[name]:validator}]}}}},
        });
        console.log("updated references", newData);

        return update(formData, {$set: newData});

    }else{

        console.log("updating formData for parent");
        const newData = update(formData, {
            [name]: {$set: value},
            "validators": {$set: [{[name]:validator}]}
        });
        console.log("updated parent", newData);

        return update(formData, {$set: newData});

    }
};



let formBuilder =  function(name){
    return function(Component){

        class FormWrapper extends React.Component {
            constructor(props) {
                super(props);
                this.handleInputsChange = this.handleInputsChange.bind(this);
                this.initializeInput = this.initializeInput.bind(this);

            }

            initializeInput(component){
                let self = this;
                this.props.setFormData(buildFormData(component.props.name, component.props.defaultValue, self.props.formData || {}, component.props.refName || null, component.props.refID || null, component.props.validator));
            }
            handleInputsChange(e = null, component){
                console.log(this.props.formData);
                console.log(component.props);
                let self = this;
                if(e) {
                    if(component.props.onChange){
                        component.props.onChange(e);
                    }
                    if (component.props.refName) {
                        this.props.setFormData(buildFormData(component.props.name, e.target.value, self.props.formData, component.props.refName, component.props.refID, component.props.validator || null));
                    } else {
                        this.props.setFormData(buildFormData(component.props.name, e.target.value, self.props.formData, null, null, component.props.validator || null));
                    }
                }
            }

            getChildContext() {
                return {
                    formName : name,
                    handleInputsChange : this.handleInputsChange,
                    initializeInput : this.initializeInput


                };
            }


            render(){
                console.log(Component);
                return <Component {...this.props} />
            }






        }
        FormWrapper.childContextTypes = {
            formName: PropTypes.string,
            handleInputsChange : PropTypes.func,
            initializeInput : PropTypes.func

        };


        return connect(mapStateToProps(name), mapDispatchToProps(name))(FormWrapper)
    }
};


export { formBuilder}