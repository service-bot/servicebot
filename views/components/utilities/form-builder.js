import { setFormData } from "./actions";
import { connect } from 'react-redux';
import _ from "lodash";
import update from 'immutability-helper';
import React from 'react';

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

let handleInputsChange = function(e = null, component){
    if(e) {
        if(component.props.onChange){
            component.props.onChange(e);
        }
        if (component.props.refName) {
            buildFormData(component.props.name, e.target.value, component.props.refName, component.props.refID, component.props.validator || null);
        } else {
            buildFormData(component.props.name, e.target.value, null, null, component.props.validator || null);
        }
    }
}


let buildFormData = function(name, value, formData, refName = null, refID = null, validator = null){

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


let formBuilder =  function(name){
    return function(component){

        class FormWrapper extends React.component {
            constructor(props) {
                super(props);
            }


        }

        return connect(mapStateToProps(name), mapDispatchToProps(name))(component)
    }
};


export { formBuilder, buildFormData}