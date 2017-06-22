import React from 'react';
import {Link, browserHistory} from 'react-router';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Inputs from "../../utilities/inputs.jsx";
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import DateFormat from "../../utilities/date-format.jsx";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import ModalPaymentSetup from "../../elements/modals/modal-payment-setup.jsx";
import Buttons from "../../elements/buttons.jsx";
import Alerts from "../../elements/alerts.jsx";
import BillingSettingsForm from "../../elements/forms/billing-settings-form.jsx";
import IconHeading from "../../layouts/icon-heading.jsx";
import { connect } from 'react-redux';

let _ = require("lodash");

class ServiceRequestForm extends React.Component {

    constructor(props){
        super(props);
        let templateId = this.props.templateId;
        this.state = {
            uid: this.props.uid,
            templateId: templateId,
            template: {},
            url: "/api/v1/service-templates/" + templateId + "/request",
            users: {},
            usersURL: "/api/v1/users",
            stripeError: false,
            loading: true,
            submitSuccessful: false,
            submissionResponse: false,
            showPaymentInputs: false,
            showFundsModal : false,
            hasFund : true,
        };

        console.log("the uid", this.state.uid);

        this.getValidators = this.getValidators.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.showFundsModal = this.showFundsModal.bind(this);
        this.hideFundsModal = this.hideFundsModal.bind(this);
        this.togglePaymentInputs = this.togglePaymentInputs.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
    }

    componentWillMount(){
        let self = this;

        //get the users for the client select list if current user is Admin
        if(isAuthorized({permissions: "can_administrate"})) {
            Fetcher(self.state.usersURL).then(function (response) {
                if (!response.error) {
                    console.log('getting users in will mount', response);
                    self.setState({users: response});
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

    componentDidMount() {
        let self = this;

        console.log("users", self.state.users);
        Fetcher(self.state.url).then(function (response) {
            if (!response.error) {
                console.log(response);
                self.setState({loading: false, template: response});
            } else {
                console.log("Error", response.error);
                self.setState({loading: false});
            }
        }).catch(function(err){
            console.log("ERROR!", err);
            browserHistory.push("/");
        })
    }

    componentDidUpdate(){
        //find the input with error and scroll to it
        let errorInputs = document.getElementsByClassName('has-error');
        if(errorInputs.length){
            let y = errorInputs[0].offsetParent.offsetTop;
            window.scrollTo(0, y);
        }
        console.log("request forrm state updated", this.state);
    }

    handleResponse(response){
        let self = this;
        if(!response.error && !response.err){
            if(response.data){
                let responseObj = response.data;
                self.setState({submitSuccessful: true, submissionResponse: responseObj});
            }else if(!isNaN(response)){
                Fetcher(`/api/v1/service-instances/${response}`).then(function(instance) {
                    if (!instance.error) {
                        self.setState({submitSuccessful: true, submissionResponse: instance});
                    }
                })
            }
        }else{
            console.log("error response", response);
        }
    }

    togglePaymentInputs(e){
        e.preventDefault();
        if(this.state.showPaymentInputs){
            this.setState({showPaymentInputs : false});
        }else{
            this.setState({showPaymentInputs : true});
        }
    }

    showFundsModal(e){
        e.preventDefault();
        this.setState({showFundsModal : true});
    }

    hideFundsModal(data){
        console.log("hide fund called", data);
        if(data.default_source){
            this.setState({showFundsModal : false, hasFund : true});
        }else{
            this.setState({showFundsModal : false});
        }
    }

    onUpdate(form){
        //getting the form JSON string from DataForm on update
        this.setState({form: form});
    }

    getValidators(references){
        //This function dynamically generates validators depending on what custom properties the instance has.
        //requires references: the service template's references.service_template_properties
        //Defining generic validators
        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateEmptyString     = (val) => { return (val.trim() != '')};
        let validateNumber          = (val) => { return !isNaN(parseFloat(val)) && isFinite(val) };
        let validateBoolean         = (val) => { return val === true || val === false || val === 'true' || val === 'false'};
        //Defining validators
        let validateClientId        = (val) => { return validateRequired(val) || {error:"Field client is required."}};
        let validateName            = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"field name is required"}};
        let validateDescriptor      = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"field service description is required"}};
        let validateDescription     = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"field service description is required"}};
        let validateTrialDay        = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field trial days is required and must be a number greater than or equal 0"}};
        let validateAmount          = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field amount is required and must be a number greater than or equal 0"}};
        let validateCurrency        = (val) => { return (validateRequired(val) && val === 'USD')};
        let validateInterval        = (val) => { return (validateRequired(val) && (val == 'day' || val == 'week' || val == 'month' || val == 'year')) || {error:"Field interval must be day, week, month or year."}};
        let validateProrated        = (val) => { return (validateRequired(val) && validateBoolean(val)) || {error: "Field prorated is required and must be boolean."}};

        let validatorJSON = {
            'client_id'             : validateClientId,
            'name'                  : validateName,
            'description'           : validateDescription,
            'statement_descriptor'  : validateDescriptor,
            'trial_period_days'     : validateTrialDay,
            'amount'                : validateAmount,
            'currency'              : validateCurrency,
            'interval'              : validateInterval,
            'subscription_prorate'  : validateProrated,
            'references'        : {
                service_template_properties :{}
            }
        };

        let clientValidatorJSON = {'references':{service_template_properties:{}}};

        let myFields = _.filter(references, {prompt_user: true});

        myFields.forEach(field => {
            if (field.required) {
                //define validator based on each input type
                if (field.prop_input_type == 'text') {
                    //TODO: might have bug with value = 0
                    let validateRequiredText = (val) => {return validateRequired(val) && validateEmptyString(val) || {error:`Field ${field.name} is required.`}};
                    _.set(validatorJSON.references.service_template_properties, [field.name, 'value'] , validateRequiredText);
                    _.set(clientValidatorJSON.references.service_template_properties, [field.name, 'value'] , validateRequiredText);
                }
            }
        });

        if(!isAuthorized({permissions: "can_administrate"})){
            return clientValidatorJSON;
        }
        return validatorJSON;
    }

    getConfirmationPageButtons(responseObj){
        if(!isAuthorized({permissions: "can_administrate"})){
            return (
                <div>
                    <Buttons containerClass="inline" text="View Your Services" btnType="primary"
                             onClick={()=>{browserHistory.push('/my-services')}}/>
                    <Buttons containerClass="inline" text="View The Service"
                             onClick={()=>{browserHistory.push(`/service-instance/${responseObj.id}`)}}/>
                </div>
            );
        }else{
            return (
                <div>
                    <Buttons containerClass="inline" text="Manage All Services" btnType="primary"
                             onClick={()=>{browserHistory.push('/manage-subscriptions')}}/>
                    <Buttons containerClass="inline" text="View The Service"
                             onClick={()=>{browserHistory.push(`/service-instance/${responseObj.id}`)}}/>
                </div>
            );
        }
    }

    render () {
        if(this.state.loading){
            return ( <Load type="content"/> );
        }else {

            if (this.state.submitSuccessful) {
                console.log("rending submitSuccessful");
                let responseObj = this.state.submissionResponse;
                return (
                    <div className="dataform row">
                        <div className="col-md-6 col-md-offset-3">
                            <h2>Your service has been created.</h2>
                            <ul>
                                <li>Client: {responseObj.user_id}</li>
                                <li>Requested by: {responseObj.requested_by}</li>
                                <li>Status: {responseObj.status}</li>
                                <li>Created on: <DateFormat date={responseObj.created_at}/></li>
                                <li>Name: {responseObj.name}</li>
                            </ul>
                            <hr/>
                            <div dangerouslySetInnerHTML={{__html: responseObj.description}}/>
                            {this.getConfirmationPageButtons(responseObj)}
                        </div>
                    </div>
                );
            } else {

                const users = this.state.users;
                const sortedUsers = _.sortBy(users, ['id']);
                let userOptions = (userList)=> {
                    return _.map(userList, (user)=>{ return new Object({[user.email]: user.id}) } );
                };
                let userOptionList = userOptions(sortedUsers);
                const fields = this.state.template;
                const subscriptionType = this.state.template.type;
                const references = this.state.template.references.service_template_properties.length > 0 ? this.state.template.references.service_template_properties : false;
                // console.log("fields", fields);

                let submitButton = <Buttons buttonClass="btn-primary btn-bar" size="lg" btnType="primary" text="Submit Request" type="submit" value="submit"/>;

                if(this.state.template.amount > 0 && !this.state.hasFund){
                    submitButton = <Buttons buttonClass="btn-primary" btnType="primary" text="Submit Request" onClick={this.showFundsModal}/>
                }

                let getAlerts = ()=>{
                    if(this.state.stripeError ){
                        if(isAuthorized({permissions: "can_administrate"})){
                            return (
                                <Alerts type="danger" message={this.state.stripeError.message}
                                       position={{position: 'fixed', bottom: true}}
                                       icon="exclamation-circle" />
                            );
                        }else{
                            return (
                                <Alerts type="danger" message={'System Error: Please contact admin for assistance.'}
                                       position={{position: 'fixed', bottom: true}}
                                       icon="exclamation-circle" />
                            );
                        }
                    }
                };

                // console.log("stripe errors xxxxx", this.state.stripeError);
                return (
                    <div>
                        {getAlerts()}
                        <DataForm validators={this.getValidators(references)}
                                  handleResponse={this.handleResponse}
                                  onUpdate={this.onUpdate}
                                  beforeSubmit={this.getStripeToken}
                                  url={`/api/v1/service-templates/${this.state.templateId}/request`}>

                            <div className="row">
                                <div className="basic-info col-md-6">
                                    <div className="service-request-details">
                                        <IconHeading imgIcon="/assets/custom_icons/what_you_are_getting_icon.png" title="What you are getting"/>
                                        <div dangerouslySetInnerHTML={{__html: this.state.template.details}}/>
                                    </div>
                                </div>
                                <div className="basic-info col-md-6">
                                    <div className="service-request-form">
                                        <IconHeading imgIcon="/assets/custom_icons/get_your_service_icon.png" title="Get your service"/>

                                        <Authorizer permissions="can_administrate">
                                            <div className="basic-info-input-group">
                                                <Inputs type="select" label="For Client" name="client_id"
                                                        value={sortedUsers.map(function (user) {
                                                            return user.id
                                                        })[0]}
                                                        options={userOptionList}
                                                        onChange={function () {
                                                        }} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="text" label="Name" name="name" defaultValue={fields.name}
                                                        onChange={function () {
                                                        }} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="text" label="Description" name="description"
                                                        defaultValue={fields.description}
                                                        onChange={function () {
                                                        }} receiveOnChange={true} receiveValue={true}/>
                                            </div>

                                            {this.state.showPaymentInputs &&
                                                <div className="payment-plan-input-group">
                                                    <h4>Payment Info</h4>

                                                    <Inputs type="text" maxLength="22" label="Statement Descriptor"
                                                            name="statement_descriptor" defaultValue={fields.statement_descriptor}
                                                            onChange={function () {
                                                            }} receiveOnChange={true} receiveValue={true}/>

                                                    <Inputs type="number" label="Trial Period" name="trial_period_days"
                                                            defaultValue={fields.trial_period_days}
                                                            onChange={function () {
                                                            }} receiveOnChange={true} receiveValue={true}/>

                                                    <Inputs disabled={subscriptionType != 'subscription'} type="price" label="Amount" name="amount" defaultValue={fields.amount}
                                                            onChange={function () {
                                                            }} receiveOnChange={true} receiveValue={true}/>

                                                    <Inputs type="hidden" disabled label="Currency" name="currency"
                                                            defaultValue={fields.currency}
                                                            onChange={function () {
                                                            }} receiveOnChange={true} receiveValue={true}/>


                                                    {/* TODO: need frontend validation for monthly cannot be <= 12 */}

                                                    {subscriptionType == 'subscription' &&
                                                    <div>
                                                        <Inputs type="select" label="Interval" name="interval"
                                                                defaultValue={fields.interval}
                                                                options={[{'Daily': 'day'}, {'Weekly': 'week'}, {'Monthly': 'month'}, {'Yearly': 'year'}]}
                                                                onChange={function () {
                                                                }} receiveOnChange={true} receiveValue={true}/>

                                                        <Inputs type="number" label="Interval Count" name="interval_count"
                                                                defaultValue={fields.interval_count}/>

                                                        <Inputs type="select" label="Prorated?" name="subscription_prorate"
                                                                defaultValue={fields.subscription_prorate}
                                                                options={[{true: 'Yes'}, {false: 'No'}]}
                                                                onChange={function () {
                                                                }} receiveOnChange={true} receiveValue={true}/>
                                                    </div>
                                                    }

                                                </div>
                                            }
                                            <Buttons text={this.state.showPaymentInputs ? 'Basic' : 'Advanced'}
                                                     onClick={this.togglePaymentInputs}/>
                                        </Authorizer>

                                        {!this.state.uid &&
                                            <Inputs type="text" label="Email Address" name="email" onChange={function () {
                                            }} receiveOnChange={true} receiveValue={true}/>
                                        }

                                        {this.state.stripToken &&
                                            <Inputs type="hidden" name="token_id" value={this.state.stripToken} onChange={function () {
                                            }} receiveOnChange={true} receiveValue={true}/>
                                        }

                                        {references &&
                                            <div className="additional-info-input-group">
                                                <Authorizer permissions="can_administrate">
                                                    <h4>Customer Information</h4>
                                                </Authorizer>
                                                {references.map(reference => (
                                                    (!reference.private || isAuthorized({permissions: 'can_administrate'})) &&
                                                    <div key={`custom-fields-${reference.prop_label}`}>
                                                        <DataChild modelName="service_template_properties"
                                                                   objectName={reference.name}>
                                                            <input type="hidden" name="id" value={reference.id}/>
                                                            <Inputs type={reference.prop_input_type}
                                                                    label={reference.prop_label}
                                                                    name="value"
                                                                    disabled={!reference.prompt_user && !isAuthorized({permissions: 'can_administrate'})}
                                                                    defaultValue={reference.value}
                                                                    options={reference.prop_values}
                                                                    onChange={function () {
                                                                    }} receiveOnChange={true} receiveValue={true}/>
                                                        </DataChild>
                                                    </div>
                                                ))}
                                            </div>
                                        }

                                        {
                                            <BillingSettingsForm context="SERVICE_REQUEST"/>
                                        }

                                        <div id="request-submission-box">
                                            {submitButton}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DataForm>



                        {(this.state.showFundsModal) &&
                            <ModalPaymentSetup hide={this.hideFundsModal}
                                               modalCallback={this.hideFundsModal}
                                               message={
                                                   {title: "Looks like you don't have a payment source in your account, let's setup your payment method here first.",
                                                    body: "You will be able to continue you service request once your payment method is setup."}
                                               }/>
                        }
                    </div>
                );
            }
        }
    }
}

export default connect((state) => {return {uid:state.uid}})(ServiceRequestForm);