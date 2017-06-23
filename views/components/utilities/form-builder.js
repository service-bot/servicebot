import { setFormData } from "./actions";
import { connect } from 'react-redux';
import _ from "lodash";
import update from 'immutability-helper';
import React from 'react';
import PropTypes from 'prop-types';


let mapStateToProps = function(name, mapState){

    return function(state, ownProps) {
        if (state.allForms[name]) {
            return {...mapState(state), "formData": state.allForms[name]};
        }
    }
};


let mapDispatchToProps = function(name){
    return (dispatch, ownProps) => {
        return {
            setFormData: (newFormData) => {
                dispatch(setFormData(name, newFormData))
            },
            validateForm: (formData) => {
                let validatedForm = handleValidation(formData);
                dispatch(setFormData(name, validatedForm));
                return validatedForm;
            }
        }
    }
};


let handleValidation = function(stateFormData, newFormData = null, refModel = null, refIndex = null){

    let self = this;
    let errors = false; //this is used to check and set the boolean error at the top level of formData object.
    let currentDataset = stateFormData; //this will be a subset of the original formData when it's in the recursive call.
    let formData = newFormData || stateFormData; //this is to keep a full object of the updated formData in every recursive call.
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
};


let buildFormData = function(name, value, formData, refName = null, refID = null, validator = null){
    if(refName && refID){

        console.log("inital formData in buildFormData", formData);
        let refIndex = _.findIndex(formData.references[refName], ['id', refID]);
        if(refIndex == -1){
            console.log("refIndex is -1", refIndex);
            refIndex = formData.references[refName].length;
        }
        const newData = update(formData, {references: { [refName]:{ [refIndex]:{ [name]: {$set: value}, "validators": {$set: [{[name]:validator}]}}}}});
        return update(formData, {$set: newData});

    }else{

        const newData = update(formData, {
            [name]: {$set: value},
            "validators": {$set: [{[name]:validator}]}
        });
        return update(formData, {$set: newData});

    }
};


let buildFormRefsData = function (formData, refName, refID) {
    console.log("initial formData", formData);
    if((!refName && !refID) || !refName){
        return formData
    }
    if(formData.references && !formData.references[refName]){
        console.log("setting up refName", formData);
        formData = update(formData, {"references" :
            {$set: {[refName]:[]}}});
        console.log("inserted refName", formData);
    if(formData.references && !formData.references[refName][refID])
        formData = update(formData, {"references": {[refName]: {$push: [{id: refID}]}}});
    }


    return formData;
};


let formBuilder =  function(formName, defaultFormData=null, mapState = null, mapDispatch = null){
    return function(Component){

        class FormWrapper extends React.Component {
            constructor(props) {
                super(props);
                this.handleInputsChange = this.handleInputsChange.bind(this);
                this.initializeInput = this.initializeInput.bind(this);

                this.props.setFormData(defaultFormData || {"references" : {}});
            }

            initializeInput(component){
                let self = this;
                console.log("inputs component", self);
                let formData = buildFormRefsData(this.props.formData, component.props.refName, component.props.refID);
                this.props.setFormData(buildFormData(component.props.name, component.props.defaultValue, formData || {}, component.props.refName || null, component.props.refID || null, component.props.validator));
            }

            handleInputsChange(e = null, component){
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
                    formName : formName,
                    handleInputsChange : this.handleInputsChange,
                    initializeInput : this.initializeInput
                };
            }

            render(){ //renders your form component
                return <Component {...this.props} />
            }

        }

        FormWrapper.childContextTypes = {
            formName: PropTypes.string,
            handleInputsChange : PropTypes.func,
            initializeInput : PropTypes.func

        };

        return connect(mapStateToProps(formName, mapState), mapDispatchToProps(formName, mapDispatch))(FormWrapper)
    }
};


export { formBuilder }