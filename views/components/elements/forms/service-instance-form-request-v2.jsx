import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Inputs from "../../utilities/inputsV2.jsx";
import update from 'immutability-helper';
import Buttons from "../../elements/buttons.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");
import { formBuilder } from "../../utilities/form-builder";

const FORM_NAME = "reqForm";

class ServiceRequestFormV2 extends React.Component {

    constructor(props){

        super(props);
        let templateId = this.props.templateId || 1;

        this.state = {
            uid: this.props.uid,
            stripToken: null,
            templateId: templateId,
            templateData: null,
            formData: null,
            formURL: "/api/v1/service-templates/" + templateId + "/request",
            formResponseData: null,
            usersData: {},
            usersURL: "/api/v1/users",
            loading: true
        };

        this.buildFormData = this.buildFormData.bind(this);
            this.handleInputsChange = this.handleInputsChange.bind(this);
        // this.handleValidation = this.handleValidation.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
    }

    componentWillMount(){
        let self = this;

        //get the users for the client select list if current user is Admin
        if(isAuthorized({permissions: "can_administrate"})) {
            Fetcher(self.state.usersURL).then(function (response) {
                if (!response.error) {
                    console.log('User Data', response);
                    self.setState({usersData: response});
                } else {
                    console.log('error getting users', response);
                }
            });
        }

        //try getting user's fund if current user is NOT Admin
        if(!isAuthorized({permissions: "can_administrate"})) {
            Fetcher("/api/v1/funds/own").then(function (response) {
                if (!response.error && response.length == 0) {
                    console.log("fund", response);
                    self.setState({hasFund: false});
                }
            });
        }
    }

    componentDidMount(){

        let self = this;
        Fetcher(self.state.formURL).then(function (response) {
            if (!response.error) {
                console.log("Service Template", response);
                self.setState({loading: false, templateData: response, formData: response});
            } else {
                console.log("Error", response.error);
                self.setState({loading: false});
            }
        }).catch(function(err){
            console.log("ERROR!", err);
        });

    }

    componentDidUpdate(){
        console.log("formData did update", this.state.formData);
    }

    handleInputsChange(e = null, component){
        if(e) {
            if (component.props.refName) {
                this.buildFormData(component.props.name, e.target.value, component.props.refName, component.props.refID, component.props.validator || null);
            } else {
                this.buildFormData(component.props.name, e.target.value, null, null, component.props.validator || null);
            }
        }
    }

    buildFormData(name, value, refName = null, refID = null, validator = null){

        if(refName && refID){

            this.setState(currentState => {

                console.log("updating formData for references");
                let refIndex = _.findIndex(currentState.formData.references[refName], ['id', refID]);
                const newData = update(this.state.formData, {
                    references: { [refName]:{ [refIndex]:{ [name]: {$set: value}, "validators": {$set: [{[name]:validator}]}}}},
                });
                console.log("updated references", newData);

                return update(currentState, {"formData": {$set: newData}});
            });
        }else{
            this.setState(currentState => {

                console.log("updating formData for parent");
                const newData = update(currentState.formData, {
                    [name]: {$set: value},
                    "validators": {$set: [{[name]:validator}]}
                });
                console.log("updated parent", newData);

                return update(currentState, {"formData": {$set: newData}});
            });
        }
    }

    // handleValidation(stateFormData, newFormData = null, refModel = null, refIndex = null){
    //
    //     let self = this;
    //     let errors = false;
    //     let currentDataset = stateFormData;
    //     let formData = newFormData || stateFormData;
    //     if(refModel === null && refIndex === null){
    //         formData = update(formData, { "hasErrors": {$set: false} });
    //         self.setState({"formData": formData});
    //     }
    //     if(currentDataset.validators && currentDataset.validators.length) {
    //         currentDataset.validators.map((validator) => {
    //             let key = Object.keys(validator)[0];
    //             let result = typeof(validator[key]) === "function" ? validator[key](currentDataset[key]) : true;
    //             if (result !== true) {
    //                 errors = true;
    //                 if(refModel === null && refIndex === null) {
    //                     formData = update(formData, { "errors": { $set: [{ "field": key, "message": result }] } });
    //                 }else{
    //                     formData = update(formData, { "references" : { [refModel] : { [refIndex]: { "errors": { $set: [{ "field": key, "message": result }] } } } } });
    //                     return(formData);
    //                 }
    //             }else{ //the error is corrected, remove item from the error object
    //                 if(refModel === null && refIndex === null) {
    //                     let filteredErrors = _.filter(formData.errors, (obj)=>{ return obj.field != key });
    //                     formData = update(formData, { "errors": {$set: filteredErrors} });
    //                 }else{
    //                     let filteredErrors = _.filter(currentDataset.errors, (obj)=>{ return obj.field != key });
    //                     formData = update(formData, { "references" : { [refModel] : { [refIndex]: { "errors": { $set: filteredErrors } } } } });
    //                     return(formData);
    //                 }
    //             }
    //         });
    //         if(currentDataset.references && Object.keys(currentDataset.references).length){
    //             _.map(currentDataset.references, (refModel, key)=>{
    //                 refModel.map((refField, index)=>{
    //                     formData = self.handleValidation(refField, formData, key, index);
    //                 });
    //             });
    //         }
    //     }
    //     if(errors){
    //         formData = update(formData, { "hasErrors": {$set: true} });
    //     }
    //     self.setState({"formData": formData});
    //     return formData;
    // }

    handleSubmission(){

        let self = this;

        let payload = self.props.validateForm(self.props.formData);

        if(!payload.hasErrors) {
            self.setState({ajaxLoad: true});

            Fetcher(this.state.formURL, 'POST', payload).then(function (response) {
                if (!response.error) {
                    console.log('submission response', response);
                    self.setState({ajaxLoad: false, success: true});
                } else {
                    self.setState({ajaxLoad: false});
                    console.log(`Problem PUT ${self.state.formURL}`, response.error);
                }
            });
        }else{
            console.log("errors found by validators", payload);
        }
    }

    render(){
        if(this.state.loading){
            return ( <Load type="content"/> );
        }else{

            if(this.state.formResponseData){
                return ( <h3>Got request</h3> );
            }else if(this.state.templateData){

                const users = this.state.usersData;
                const sortedUsers = _.sortBy(users, ['id']);
                let userOptions = (userList)=> {
                    return _.map(userList, (user)=>{ return new Object({[user.email]: user.id}) } );
                };
                let userOptionList = userOptions(sortedUsers);

                //define validation functions
                let validateEmail      = (val) => { return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(val) || 'Email format is not validate'};
                let validateRequired   = (val) => { return (val.trim() != '' || 'This field is required')};
                let validateNumber     = (val) => { return !isNaN(parseFloat(val)) && isFinite(val) || 'This field must be a number'};
                let validateBoolean    = (val) => { return (val === true || val === false || val === 'true' || val === 'false') || 'This field must be a boolean'};
                return (
                    <div>

                        <pre>{JSON.stringify(this.props.formData, null, '\t')}</pre>
                        <h3>Service</h3>

                        <Authorizer permissions="can_administrate">
                        <Inputs type="select" label="For Client" name="client_id"
                                value={sortedUsers.map(function (user) {return user.id })[0]}
                                options={userOptionList}
                                formLess={true}/>
                        </Authorizer>

                        {!this.state.uid &&
                        <Inputs type="text" label="Email Address" name="email" onChange={console.log("OK")} formLess={true} buildFormData={this.buildFormData} validator={validateEmail} errors={this.state.formData.errors}/>
                        }

                        {this.state.stripToken &&
                        <Inputs type="hidden" name="token_id" value={this.state.stripToken} onChange={console.log("YO")} formLess={true}/>
                        }

                        {this.state.formData.references.service_template_properties.length > 0 &&
                        this.state.formData.references.service_template_properties.map(reference => ((!reference.private || isAuthorized({permissions: 'can_administrate'})) &&
                        <div key={`custom-fields-${reference.prop_label}`}>
                            <Inputs type="hidden" name="id" value={reference.id}
                                    refName="service_template_properties" refID={reference.id}/>
                            <Inputs type={reference.prop_input_type} label={reference.prop_label} name="value"
                                    disabled={!reference.prompt_user && !isAuthorized({permissions: 'can_administrate'})}
                                    defaultValue={reference.value}
                                    options={reference.prop_values}
                                    refName="service_template_properties" refID={reference.id}
                                    buildFormData={this.buildFormData}
                                    validator={reference.required && validateRequired}
                                    errors={reference.errors}
                            />
                        </div>
                        ))}

                        <Buttons buttonClass="btn-primary btn-bar" size="lg" position="center"
                                 btnType="primary" text="Submit Request" value="submit"
                                 onClick={this.handleSubmission}
                        />

                    </div>
                );
            }else{
                return( <h3>Error fetching service data</h3> );
            }

        }

    }


}

// export default connect((state) => {return {uid:state.uid}})(ServiceRequestFormV2);
export default formBuilder(FORM_NAME, (state) => {return {uid:state.uid}})(ServiceRequestFormV2)