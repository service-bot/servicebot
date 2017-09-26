import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import { Field, Fields,  FormSection,FieldArray, reduxForm, formValueSelector, change, unregisterField, getFormValues } from 'redux-form'
import {connect } from "react-redux";
import { RenderWidget, WidgetList, widgets, SelectWidget} from "../../utilities/widgets";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {inputField, selectField, priceField} from "./servicebot-base-field.jsx";
import BillingSettingsForm from "../../elements/forms/billing-settings-form.jsx";
import {Price} from "../../utilities/price.jsx";
import Fetcher from "../../utilities/fetcher.jsx";
import IconHeading from "../../layouts/icon-heading.jsx";
import ModalUserLogin from "../modals/modal-user-login.jsx";
import {setUid, setUser, fetchUsers} from "../../utilities/actions";
import {addAlert} from "../../utilities/actions";
let _ = require("lodash");

import ServiceBotBaseForm from "./servicebot-base-form.jsx";



const required = value => value ? undefined : 'Required';
const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : undefined;
const maxLength15 = maxLength(15);
const maxLength22 = maxLength(22);
const number = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined;
const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : undefined;
const minValue18 = minValue(18);


const selector = formValueSelector('servicebotForm'); // <-- same as form name

const customFieldComponent = ({input, label, type, formJSON, config, meta: {touched, error, warning}}) => (
    <div className={`form-group form-group-flex`}>
        {label && <label className="control-label form-label-flex-md">{label}</label>}
        <div className="form-input-flex">
            {type === "textarea" && <textarea className="form-control" {...input} placeholder={label}/> }
            {(type === "text" || type === "number") && <input className="form-control" {...input} placeholder={label} type={type}/> }
            {type === "checkbox" &&
                <div>
                <input className="form-control checkbox" {...input} placeholder={label} type={type}/>
                    {config.pricing && `[${config.operation}s ${config.pricing.value}]`}
                </div>
            }
            {type === "select" &&
                <select className="form-control" {...input} placeholder={label}>
                    {config && config.value.map((option, index) =>
                        <option key={index} value={option}>
                            {config.pricing ? (
                                `${option} [${config.operation}s $${config.pricing.value[option]}]`
                            ) : (
                                {option}
                            )}
                        </option>
                    )
                    }
                </select> }
            {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>)) }
        </div>
    </div>
);

let CustomField =  (props) => {
    const {member, formJSON} = props;
    return (
        <div>
            <Field
                name={`${member}.data.value`}
                type={formJSON.type}
                component={customFieldComponent}
                label={formJSON.prop_label}
                value={formJSON.data.value}
                formJSON={formJSON}
                config={formJSON.config}
                />
        </div>
    )
};

CustomField = connect((state, ownProps) => {
    return {
        "privateValue" : selector(state, "references.service_template_properties")[ownProps.index].private,
        "typeValue" : selector(state, "references.service_template_properties")[ownProps.index].prop_input_type,
        "configValue" : selector(state, `references.service_template_properties`)[ownProps.index].config,
        "myValues" : selector(state, `references.${ownProps.member}`)

    }
}, (dispatch, ownProps)=> {
    return {"changePrivate" : () => {
        dispatch(change("serviceTemplateForm", `references.${ownProps.member}.required`, false));
        dispatch(change("serviceTemplateForm", `references.${ownProps.member}.prompt_user`, false));
    }
    }
})(CustomField);


//Custom property
const renderCustomProperty = (props) => {
    const { privateValue, fields, formJSON, meta: { touched, error } } = props;
    return (
        <div>
            <ul>
            {fields.map((customProperty, index) =>
                <li key={index}>
                    <CustomField member={customProperty} index={index} formJSON={formJSON[index]}/>
                </li>
            )}
        </ul>
        </div>
    )};



//The full form
class ServiceRequestForm extends React.Component {

    constructor(props){
        super(props);
    }
    render() {

        let props = this.props;


        const {handleSubmit, pristine, reset, submitting, serviceTypeValue, invalid, formJSON, helpers} = props;

        const sectionDescriptionStyle = {
            background: "#7fd3ff",
            height: "100px",
            width: "100px",
            padding: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
        };
        let getPrice = function () {
            const price = formJSON.amount;
            let updatedPrice = formJSON.amount;
            let properties = formJSON.references.service_template_properties;
            let priceChanges = [];
            console.log("Our price is: ", price);
            console.log("Our properties are", properties);
            properties.map((prop) => {
                console.log("this is prop", prop.id);
                if (prop.config.pricing) {
                    switch (prop.type) {
                        case 'checkbox':
                            if (prop.data.value) {
                                let priceChange = getPriceChange(price, prop.config.operation, prop.config.pricing.value);
                                priceChanges.push(`${prop.prop_label} ${prop.config.operation}s ${priceChange}`);
                                updatedPrice += priceChange;
                            }
                            break;
                        case 'select':
                            let selectedOption = prop.data.value;
                            console.log("its a select", prop.config.pricing.value[selectedOption]);
                            let priceChange = getPriceChange(price, prop.config.operation, prop.config.pricing.value[selectedOption]);
                            priceChanges.push(`${prop.prop_label} ${prop.config.operation}s ${priceChange}`);
                            updatedPrice += priceChange;
                            break;
                        default:
                            console.log("Property type doesn't change price")
                    }
                }
            });
            return updatedPrice
        };
        let getRequestText = ()=>{
            let serType = formJSON.type;
            // console.log("service type",myService.type);
            if (serType == "subscription"){
                return (<span>{"Subscribe"} <Price value={getPrice()}/>{formJSON.interval_count == 1 ? ' /' : ' / ' + formJSON.interval_count} {' '+formJSON.interval}</span>);
            }else if (serType == "one_time"){
                return (<span>{"Buy"} <Price value={getPrice()}/></span>);
            }else if (serType == "custom"){
                return ("Request");
            }else{
                return (<span><Price value={getPrice()}/></span>)
            }
        };
        const users = helpers.usersData;
        const sortedUsers = _.sortBy(users, ['id']);
        let userOptions = (userList)=> {
            return _.map(userList, (user)=>{ return new Object({[user.email]: user.id}) } );
        };
        let userOptionList = userOptions(sortedUsers);
        const getPriceChange = function(basePrice, modifier, amount){
            let priceChange = 0;
            switch(modifier) {
                case 'add':
                    priceChange = amount;
                    break;
                case 'subtract':
                    priceChange = -amount;
                    break;
                case 'multiply':
                    priceChange = basePrice * (amount/100);
                    break;
                case 'divide':
                    priceChange = -(basePrice * (amount/100));
                    break;
                default:
                    console.log("Property type doesn't change price")
            }
            return priceChange;
        };



        return (
            <div>
                <div className="col-md-3">
                Tabs
                <pre className="" style={{maxHeight: '300px', overflowY: 'scroll'}}>
                {JSON.stringify(formJSON, null, 2)}
                </pre>
                </div>
                <div className="col-md-12">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-8">
                                <Authorizer permissions="can_administrate">
                                    <Field name="client_id"
                                           component={selectField}
                                           label="For Client"
                                           options={sortedUsers}
                                           validate={[required]}
                                    />
                                </Authorizer>

                                {!helpers.uid && <div>
                                    <Field name="email" type="text"
                                           component={inputField} label="Email Address"
                                           validate={[required]}/>

                                    {helpers.emailExists && <ModalUserLogin
                                        hide={this.closeUserLoginModal}
                                        email={this.props.formData.email}
                                        invitationExists={this.state.invitationExists}
                                        width="640px"
                                        serviceCreated={this.state.serviceCreated}/>
                                    }
                                    </div>
                                }

                                <h3>Custom Fields</h3>
                                <FormSection name="references">
                                    <FieldArray name="service_template_properties"
                                                component={renderCustomProperty}
                                                formJSON={formJSON.references.service_template_properties}/>
                                </FormSection>

                                {helpers.hasCard &&
                                <div>
                                    {helpers.stripToken ?
                                        <div>
                                            <p className="help-block">You {helpers.card.funding} card in your account ending in: {helpers.card.last4} will be used.</p>
                                            <span className="help-block">If you wish to use a different card, you can update your card under <Link to="/billing-settings">billing settings.</Link></span>
                                        </div> :
                                        <p className="help-block">Using {helpers.card.funding} card ending in: {helpers.card.last4}</p>
                                    }
                                </div>
                                }
                            </div>
                        </div>
                        <button className="btn btn-rounded btn-primary" type="submit"
                                value="submit">
                            {getRequestText()}
                        </button>
                    </form>
                </div>
            </div>
        )
    };
}

ServiceRequestForm = connect((state, ownProps) => {
    return {
        "serviceTypeValue" : selector(state, `type`),
        formJSON: getFormValues('servicebotForm')(state),

    }
}, (dispatch, ownProps)=> {
    return {
    }
})(ServiceRequestForm);

class ServiceTemplateForm extends React.Component {

    constructor(props){
        super(props);

        let templateId = this.props.templateId || 1;

        this.state = {
            uid: this.props.uid,
            stripToken: null,
            templateId: templateId,
            templateData: this.props.service,
            formData: this.props.service,
            formURL: "/api/v1/service-templates/" + templateId + "/request",
            formResponseData: null,
            formResponseError: null,
            serviceCreated: null,
            usersData: {},
            usersURL: "/api/v1/users",
            hasCard: null,
            loading: true
        };

        this.closeUserLoginModal = this.closeUserLoginModal.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
        this.retrieveStripeToken = this.retrieveStripeToken.bind(this);
        this.checkIfUserHasCard = this.checkIfUserHasCard.bind(this);
    }
    componentWillMount(){
        let self = this;

        //get the users for the client select list if current user is Admin
        if(isAuthorized({permissions: "can_administrate"})) {
            Fetcher(self.state.usersURL).then(function (response) {
                if (!response.error) {
                    // console.log('User Data', response);
                    let userRoleList = response.filter(function(user){
                        return user.references.user_roles[0].role_name === 'user';
                    });
                    self.setState({usersData: userRoleList});
                } else {
                    console.log('Error getting users', response);
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
                self.setState({loading: false, templateData: response, formData: response});
            } else {
                console.log("Error", response.error);
                self.setState({loading: false});
            }
        }).catch(function(err){
            console.log("ERROR!", err);
        });

        if(this.props.uid) {
            this.checkIfUserHasCard();
        }

    }

    componentDidUpdate(nextProps, nextState){
        // console.log("next props", nextProps);
        // console.log("next state", nextState);
        if(nextState.stripToken != this.state.stripToken){
            console.log(nextState.stripToken, this.state.stripToken);
        }
        if(nextProps.uid && this.state.hasCard === null){
            this.checkIfUserHasCard();
        }
        if(nextProps.uid && nextState.serviceCreated){
            browserHistory.push(`/service-instance/${nextState.serviceCreated.id}`);
        }
    }

    *tokenGenerator(values, callback){
        console.log("WE IN THE TOKEN GENERATOR");
        let token = yield;
        console.log("got token ", token);
        values.token_id = token.id;
        callback(values);
    }

    async retrieveStripeToken(stripeForm, token = null){ //getToken is the getToken function, token is the token
        let self = this;
        console.log("RETRIEVE STRIPE TOKEN WUZ CALLED")
        if(stripeForm){
            this.setState({stripeForm: stripeForm});
        }
        if(token) {
            this.setState({stripToken: token});
            this.state.tokenGenerator.next(token)
        }
    }

    handleSubmission(){
        let self = this;
        let payload = self.props.validateForm(self.props.formData);

        if(!this.state.hasCard && this.state.stripeForm && !this.state.stripToken){
            this.state.stripeForm.dispatchEvent(new Event('submit', {'bubble': true}));
        }else if(this.state.hasCard || this.state.stripToken || isAuthorized({permissions: "can_administrate"})){
            if(!payload.hasErrors) {
                self.setState({ajaxLoad: true});

                Fetcher(this.state.formURL, 'POST', payload).then(function (response) {
                    if (!response.error) {
                        if(self.props.uid) {
                            browserHistory.push(`/service-instance/${response.id}`);
                            self.setState({ajaxLoad: false, success: true});
                        }else if(response.url && response.api){ //this is a case where the user is new and has invitation
                            self.props.setUid(response.user_id);
                            self.props.setUser(response.user_id);
                            self.props.addAlert({id:'user-requested-service-new-user-invited', message: 'Please check your email and set your password to complete your account.', show: true});
                            localStorage.setItem("permissions", response.permissions);
                            self.setState({emailExists: true, invitationExists: true, serviceCreated: response, ajaxLoad: false, success: true});
                        }else{
                            self.setState({ajaxLoad: false, success: true, serviceCreated: response});
                        }
                    } else {
                        self.setState({ajaxLoad: false});
                        console.log(`Server Error:`, response.error);
                        if(response.error == "This email already exists in the system"){
                            self.setState({emailExists: true, formResponseError: response.error});
                        }else if(response.error == "Invitation already exists for this user"){
                            self.setState({emailExists: true, invitationExists: true, formResponseError: response.error});
                        }
                    }
                });
            }else{
                console.log("Errors found by validators", payload);
            }
        }else{
            console.log("User doesn't have card nor a stripe token");
        }
    }


    closeUserLoginModal(){
        this.setState({emailExists: false});
    }

    checkIfUserHasCard(){
        let self = this;
        Fetcher(`/api/v1/users/${self.props.uid}`).then(function (response) {
            if(!response.error){
                if(_.has(response, 'references.funds[0]') && _.has(response, 'references.funds[0].source.card')){
                    let fund = _.get(response, 'references.funds[0]');
                    let card = _.get(response, 'references.funds[0].source.card');
                    self.setState({
                        loading: false,
                        hasCard: true,
                        fund: fund,
                        card: card,
                        personalInformation: {
                            name: card.name,
                            address_line1: card.address_line1,
                            address_line2: card.address_line2,
                            address_city: card.address_city,
                            address_state: card.address_state,
                        }
                    }, function(){
                        console.log("Checked user and found card, state is set to", self.state);
                        return true;
                    });
                }
            }else{
                self.setState({loading: false, hasCard: false});
                return false;
            }
        });
    }

    render () {
        let self = this;
        let initialValues = this.props.service;
        let initialRequests = [];
        let submissionPrep;
        let submissionRequest = {
            'method': 'POST',
            'url': `/api/v1/service-templates/${this.props.templateId}/request`
        };
        let successMessage = "Service Requested";
        let helpers = Object.assign(this.state, this.props);
        if(!isAuthorized({permissions: "can_administrate"})){
            submissionPrep = function (values, callback){
                console.log("we've arrived in submission prep -------")
                let tokenGenerator = self.tokenGenerator(values, callback);
                tokenGenerator.next();
                self.setState({tokenGenerator}, (state => {
                    self.state.stripeForm.dispatchEvent(new Event('submit', {'bubble': true}));
                }))

            };
        }

        //make new field for CC number

        return (

            <div>
                {(!this.state.hasCard && !isAuthorized({permissions: "can_administrate"})) &&
                <BillingSettingsForm context="SERVICE_REQUEST" retrieveStripeToken={this.retrieveStripeToken}/>
                }

                <ServiceBotBaseForm
                    form = {ServiceRequestForm}
                    initialValues = {initialValues}
                    initialRequests = {initialRequests}
                    submissionPrep = {submissionPrep}
                    submissionRequest = {submissionRequest}
                    successMessage = {successMessage}
                    handleResponse = {this.handleResponse}
                    helpers = {helpers}
                />
            </div>
        )

    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};

export default connect(mapStateToProps)(ServiceTemplateForm);

