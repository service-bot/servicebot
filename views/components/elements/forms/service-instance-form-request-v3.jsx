import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import consume from "pluginbot-react/src/consume";
import {
    Field,
    Fields,
    FormSection,
    FieldArray,
    reduxForm,
    formValueSelector,
    change,
    unregisterField,
    getFormValues
} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, widgets, SelectWidget} from "../../utilities/widgets";
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
import cookie from 'react-cookie';

import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import {getPrice} from "../../../../lib/handleInputs";
import values from 'object.values';

if (!Object.values) {
    values.shim();
}


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

// const customFieldComponent = ({input, label, type, formJSON, config, meta: {touched, error, warning}}) => (
//     <div className={`form-group form-group-flex`}>
//         {label && <label className="control-label form-label-flex-md">{label}</label>}
//         <div className="form-input-flex">
//             {type === "textarea" && <textarea className="form-control" {...input} placeholder={label}/> }
//             {(type === "text" || type === "number") && <input className="form-control" {...input} placeholder={label} type={type}/> }
//             {type === "checkbox" &&
//                 <div>
//                 <input className="form-control checkbox" {...input} placeholder={label} type={type}/>
//                     {config.pricing && `[${config.operation}s ${config.pricing.value}]`}
//                 </div>
//             }
//             {type === "select" &&
//                 <select className="form-control" {...input} placeholder={label}>
//                     {config && config.value.map((option, index) =>
//                         <option key={index} value={option}>
//                             {(config.pricing && config.pricing.value.hasOwnProperty(option))? (
//                                 `${option} [${config.operation}s $${config.pricing.value[option]}]`
//                             ) : (
//                                 `${option}`
//                             )}
//                         </option>
//                     )
//                     }
//                 </select> }
//             {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>)) }
//         </div>
//     </div>
// );

//Custom property
let renderCustomProperty = (props) => {
    const { fields, formJSON, meta: { touched, error }, services : {widget} } = props;
    let widgets = widget.reduce((acc, widget) => {
        acc[widget.type] = widget;
        return acc;
    }, {});
    return (
        <div>
            {fields.map((customProperty, index) =>
            {   let property = widgets[formJSON[index].type];
                return (
                    <Field
                        key={index}
                        name={`${customProperty}.data.value`}
                        type={formJSON[index].type}
                        component={property.widget}
                        label={formJSON[index].prop_label}
                        // value={formJSON[index].data.value}
                        formJSON={formJSON[index]}
                        configValue={formJSON[index].config}
                    />)}
            )}
        </div>
    )};

renderCustomProperty = consume("widget")(renderCustomProperty);

//The full form
class ServiceRequestForm extends React.Component {

    constructor(props){
        super(props);
    }
    render() {
        let props = this.props;
        const {handleSubmit, formJSON, helpers, error, services: {widget}} = props;
        console.log(formJSON.references.service_template_properties);
        let handlers = widget.reduce((acc, widget) => {
            acc[widget.type] = widget.handler;
            return acc;

        }, {});
        console.log("MA HANDLERS", handlers);
        let newPrice = formJSON.amount;
        try {
            newPrice = getPrice(formJSON.references.service_template_properties, handlers, formJSON.amount);
            helpers.updatePrice(newPrice);
        }catch(e){
            console.error(e);
        }

        let getRequestText = ()=>{
            let serType = formJSON.type;
            if (serType == "subscription"){
                return (<span>{"Subscribe"} <Price value={newPrice}/>{formJSON.interval_count == 1 ? ' /' : ' / ' + formJSON.interval_count} {' '+formJSON.interval}</span>);
            }else if (serType == "one_time"){
                return (<span>{"Buy"} <Price value={newPrice}/></span>);
            }else if (serType == "custom"){
                return ("Request");
            }else{
                return (<span><Price value={newPrice}/></span>)
            }
        };
        const users = helpers.usersData;
        const sortedUsers = _.sortBy(users, ['id']);

        return (
            <div className="service-request-form-body">
                {/*             <div className="col-md-3">
                 Tabs
                 <pre className="" style={{maxHeight: '300px', overflowY: 'scroll'}}>
                 {JSON.stringify(formJSON, null, 2)}
                 </pre>
                 </div>*/}
                <form onSubmit={handleSubmit}>
                    <Authorizer permissions="can_administrate">
                        <Field name="client_id" component={selectField} label="For Client"
                               options={sortedUsers} validate={[required]}/>
                    </Authorizer>

                    {!helpers.uid &&
                    <div>
                        <Field name="email" type="text" component={inputField}
                               label="Email Address" validate={[required]}/>

                        {helpers.emailExists && <ModalUserLogin
                            hide={this.closeUserLoginModal}
                            email={this.props.formData.email}
                            invitationExists={this.state.invitationExists}
                            width="640px"
                            serviceCreated={this.state.serviceCreated}/>
                        }
                    </div>
                    }
                    <FormSection name="references">
                        <FieldArray name="service_template_properties" component={renderCustomProperty}
                                    formJSON={formJSON.references.service_template_properties}/>
                    </FormSection>

                    {helpers.hasCard &&
                    <div className="service-request-form-payment">
                        {helpers.stripToken ?
                            <div>
                                <p className="help-block">You {helpers.card.funding} card in your account
                                    ending in: {helpers.card.last4} will be used.</p>
                                <span className="help-block">If you wish to use a different card, you can
                                                update your card under <Link
                                        to="/billing-settings">billing settings.</Link></span>
                            </div> :
                            <p className="help-block">
                                Using {helpers.card.funding} card endingin: {helpers.card.last4}
                            </p>
                        }
                    </div>
                    }
                    <button className="btn btn-rounded btn-primary btn-bar" type="submit" value="submit">
                        {getRequestText()}
                    </button>
                    {error &&
                    <strong>
                        {error}
                    </strong>}

                    {/*<Buttons buttonClass="btn-primary btn-bar" size="lg" position="center" btnType="primary" value="submit"*/}
                             {/*onClick={()=>{}} loading>*/}
                        {/*<span>{getRequestText()}</span>*/}
                    {/*</Buttons>*/}
                </form>
            </div>
        )
    };
}

ServiceRequestForm = consume("widget")(connect((state, ownProps) => {
    return {
        "serviceTypeValue" : selector(state, `type`),
        formJSON: getFormValues('servicebotForm')(state),

    }
})(ServiceRequestForm));

class ServiceInstanceForm extends React.Component {

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
            servicePrice: this.props.service.amount,
            usersData: {},
            usersURL: "/api/v1/users",
            hasCard: null,
            loading: true
        };
        this.closeUserLoginModal = this.closeUserLoginModal.bind(this);
        this.retrieveStripeToken = this.retrieveStripeToken.bind(this);
        this.checkIfUserHasCard = this.checkIfUserHasCard.bind(this);
        this.updatePrice = this.updatePrice.bind(this);
        this.submissionPrep = this.submissionPrep.bind(this);
        this.handleResponse = this.handleResponse.bind(this);


    }

    componentWillMount(){
        let self = this;

        //get the users for the client select list if current user is Admin
        if(isAuthorized({permissions: "can_administrate"})) {
            Fetcher(self.state.usersURL).then(function (response) {
                if (!response.error) {
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
        let token = yield;
        values.token_id = token.id;
        callback(values);
    }

    updatePrice(newPrice){
        console.log("**Update price was called with price", newPrice);
        let self = this;
        self.setState({servicePrice: newPrice});
    }

    async retrieveStripeToken(stripeForm, token = null) { //getToken is the getToken function, token is the token
        let self = this;
        console.log("RETRIEVE STRIPE TOKEN WUZ CALLED")
        if (stripeForm) {
            this.setState({stripeForm: stripeForm});
        }
        if (token) {
            this.setState({stripToken: token});
            this.state.tokenGenerator.next(token)
        }
    }

    closeUserLoginModal(){
        this.setState({emailExists: false});
    }

    checkIfUserHasCard() {
        let self = this;
        Fetcher(`/api/v1/users/${self.props.uid}`).then(function (response) {
            if (!response.error) {
                if (_.has(response, 'references.funds[0]') && _.has(response, 'references.funds[0].source.card')) {
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
                    }, function () {
                        console.log("Checked user and found card, state is set to", self.state);
                        return true;
                    });
                }
            } else {
                self.setState({loading: false, hasCard: false});
                return false;
            }
        });
    }

    submissionPrep(values, callback){
        let self = this;
        let tokenGenerator = self.tokenGenerator(values, callback);
        tokenGenerator.next();
        self.setState({tokenGenerator}, (state => {
            self.state.stripeForm.dispatchEvent(new Event('submit', {'bubble': true}));
        }))

    }
    handleResponse(response){
        if(response.permissions){
            console.log("SETTIN PERMS", response);
            localStorage.setItem("permissions", response.permissions);
            this.props.setUid(response.uid);
            this.props.setUser(response.uid);

        }
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
        let successRoute = "/my-services";
        let helpers = Object.assign(this.state, this.props);
        helpers.updatePrice = self.updatePrice;
        //Gets a token to populate token_id for instance request
        if (!isAuthorized({permissions: "can_administrate"}) &&
            this.state.servicePrice > 0) {
            submissionPrep = this.submissionPrep;
        }

        return (
            <div>
                {/*Price: {this.state.servicePrice}*/}

                {(!this.state.hasCard && !isAuthorized({permissions: "can_administrate"})) &&
                this.state.servicePrice > 0 &&
                <BillingSettingsForm context="SERVICE_REQUEST" retrieveStripeToken={this.retrieveStripeToken}/>
                }
                <ServiceBotBaseForm
                    form = {ServiceRequestForm}
                    initialValues = {initialValues}
                    initialRequests = {initialRequests}
                    submissionPrep = {submissionPrep}
                    submissionRequest = {submissionRequest}
                    successMessage = {successMessage}
                    successRoute = {successRoute}
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

const mapDispatchToProps = (dispatch) => {
    return {
        setUid: (uid) => {
            dispatch(setUid(uid))
        },
        setUser: (uid) => {
            fetchUsers(uid, (err, user) => dispatch(setUser(user)));
        }
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(ServiceInstanceForm);

