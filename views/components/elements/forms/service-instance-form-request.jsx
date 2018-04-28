import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import consume from "pluginbot-react/dist/consume";
import {
    Field,
    FormSection,
    FieldArray,
    formValueSelector,
    getFormValues,
} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, widgets, SelectWidget} from "../../utilities/widgets";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {inputField, selectField, widgetField, priceField} from "./servicebot-base-field.jsx";
import {CardSection} from "../../elements/forms/billing-settings-form.jsx";
import getSymbolFromCurrency from 'currency-symbol-map'

import {Price} from "../../utilities/price.jsx";
import Fetcher from "../../utilities/fetcher.jsx";
import ModalUserLogin from "../modals/modal-user-login.jsx";
import {setUid, fetchUsers, setUser} from "../../utilities/actions";
import {required, email, numericality, length} from 'redux-form-validators'
import {injectStripe, Elements, StripeProvider} from 'react-stripe-elements';
import cookie from 'react-cookie';


let _ = require("lodash");

import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import {getPrice} from "../../../../lib/handleInputs";
import values from 'object.values';

if (!Object.values) {
    values.shim();
}

const selector = formValueSelector('serviceInstanceRequestForm'); // <-- same as form name


//Custom property
let renderCustomProperty = (props) => {
    const {fields, formJSON, meta: {touched, error}, services: {widget}} = props;
    let widgets = widget.reduce((acc, widget) => {
        acc[widget.type] = widget;
        return acc;
    }, {});
    return (
        <div>
            {fields.map((customProperty, index) => {
                    let property = widgets[formJSON[index].type];
                    let validate = [];
                    if (formJSON[index].required) {
                        validate.push(required());
                    }
                    if (formJSON[index].prompt_user) {

                        return (
                            <Field
                                key={index}
                                name={`${customProperty}.data.value`}
                                type={formJSON[index].type}
                                widget={property.widget}
                                component={widgetField}
                                label={formJSON[index].prop_label}
                                // value={formJSON[index].data.value}
                                formJSON={formJSON[index]}
                                configValue={formJSON[index].config}
                                validate={validate}
                            />)
                    } else {
                        if (formJSON[index].data && formJSON[index].data.value) {
                            return (
                                <div className={`form-group form-group-flex`}>
                                    {(formJSON[index].prop_label && formJSON[index].type !== 'hidden') && <label
                                        className="control-label form-label-flex-md">{formJSON[index].prop_label}</label>}
                                    <div className="form-input-flex">
                                        <p>{formJSON[index].data.value}</p>
                                    </div>
                                </div>)
                        } else {
                            return (<span/>)
                        }


                    }

                }
            )}
        </div>
    )
};

renderCustomProperty = consume("widget")(renderCustomProperty);


//The full form
class ServiceRequestForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let props = this.props;
        const {handleSubmit, formJSON, helpers, error, services: {widget}} = props;
        let handlers = widget.reduce((acc, widget) => {
            acc[widget.type] = widget.handler;
            return acc;

        }, {});
        let newPrice = formJSON.amount;
        try {
            newPrice = getPrice(formJSON.references.service_template_properties, handlers, formJSON.amount);
            helpers.updatePrice(newPrice);
        } catch (e) {
            console.error(e);
        }

        let getRequestText = () => {
            let serType = formJSON.type;
            let trial = formJSON.trial_period_days !== 0;
            let prefix = getSymbolFromCurrency(formJSON.currency);
            if (trial) {
                return ("Get your Free Trial")
            }
            else {
                if (serType === "subscription") {
                    return (
                        <span>{"Subscribe "}
                            <Price value={newPrice} prefix={prefix}/>
                            {formJSON.interval_count == 1 ? ' /' : ' / ' + formJSON.interval_count} {' ' + formJSON.interval}
                    </span>
                    );
                } else if (serType === "one_time") {
                    return (
                        <span>{"Buy Now"} <Price value={newPrice} prefix={prefix}/></span>
                    );
                } else if (serType === "custom") {
                    return ("Request");
                } else if (serType === "split") {
                    return ("Buy Now");
                } else {
                    return (<span><Price value={newPrice} prefix={prefix}/></span>)
                }
            }
        };
        //Sort users and if user does not have name set, set it to the email value which will always be there
        let users = _.map(helpers.usersData, user => {
            user.name = user.name || user.email;
            return user
        });
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
                               options={sortedUsers} validate={[required()]}/>
                        {(formJSON.type !== "split") &&
                        <Field name="amount" type="number"
                               component={priceField}
                               isCents={true}
                               label="Override Amount"
                               validate={numericality({'>=': 0.00})}
                        />
                        }
                    </Authorizer>

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
                                Using {helpers.card.funding} card ending in: {helpers.card.last4}
                            </p>
                        }
                    </div>
                    }

                    {!helpers.uid &&
                    <div>
                        <Field name="email" type="text" component={inputField}
                               label="Email Address" validate={[required(), email()]}/>

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

                    <button className="btn btn-rounded btn-primary btn-bar submit-request" type="submit" value="submit">
                        {getRequestText()}
                    </button>
                    {error &&
                    <strong>
                        {error}
                    </strong>}
                </form>
            </div>
        )
    };
}

ServiceRequestForm = consume("widget")(connect((state, ownProps) => {
    return {
        "serviceTypeValue": selector(state, `type`),
        formJSON: getFormValues('serviceInstanceRequestForm')(state),

    }
})(ServiceRequestForm));

class ServiceInstanceForm extends React.Component {

    constructor(props) {
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
        this.checkIfUserHasCard = this.checkIfUserHasCard.bind(this);
        this.updatePrice = this.updatePrice.bind(this);
        this.submissionPrep = this.submissionPrep.bind(this);
        this.handleResponse = this.handleResponse.bind(this);


    }

    componentWillMount() {
        let self = this;

        //get the users for the client select list if current user is Admin
        if (isAuthorized({permissions: "can_administrate"})) {
            Fetcher(self.state.usersURL).then(function (response) {
                if (!response.error) {
                    let userRoleList = response.filter(function (user) {
                        return user.references.user_roles[0].role_name === 'user' && user.status !== 'suspended';
                    });
                    self.setState({usersData: userRoleList});
                } else {
                }
            });
        }

        //try getting user's fund if current user is NOT Admin
        if (!isAuthorized({permissions: "can_administrate"})) {
            Fetcher("/api/v1/funds/own").then(function (response) {
                if (!response.error && response.length == 0) {
                    self.setState({hasFund: false});
                }
            });
        }
    }

    componentDidMount() {
        let self = this;
        Fetcher(self.state.formURL).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, templateData: response, formData: response});
            } else {
                console.error("Error", response.error);
                self.setState({loading: false});
            }
        }).catch(function (err) {
            console.error("ERROR!", err);
        });

        if (this.props.uid) {
            this.checkIfUserHasCard();
        }
    }

    componentDidUpdate(nextProps, nextState) {


        if (nextProps.uid && this.state.hasCard === null) {
            this.checkIfUserHasCard();
        }
        if (nextProps.uid && nextState.serviceCreated) {
            browserHistory.push(`/service-instance/${nextState.serviceCreated.id}`);
        }
    }


    updatePrice(newPrice) {
        let self = this;
        self.setState({servicePrice: newPrice});
    }


    closeUserLoginModal() {
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
                        return true;
                    });
                }
            } else {
                self.setState({loading: false, hasCard: false});
                return false;
            }
        });
    }

    async submissionPrep(values) {
        let token = await this.props.stripe.createToken();
        if (token.error) {
            throw token.error.message
        }
        return {...values, token_id: token.token.id};
    }

    handleResponse(response) {
        if (response.permissions) {
            localStorage.setItem("permissions", response.permissions);
            this.props.setUid(response.uid);
            this.props.setUser(response.uid);

        }
    }

    formValidation(values) {

        let props = (values.references && values.references.service_template_properties) ? values.references.service_template_properties : [];
        let re = props.reduce((acc, prop, index) => {
            if (prop.required && (!prop.data || !prop.data.value)) {
                acc[index] = {data: {value: "is required"}}
            }
            return acc;
        }, {});
        let validation = {references: {service_template_properties: re}};

        if (Object.keys(re).length === 0) {
            delete validation.references;
        }
        return validation;

    }

    render() {

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
        //If admin requested, redirect to the manage subscription page
        if (isAuthorized({permissions: "can_administrate"})) {
            successRoute = "/manage-subscriptions";
        }

        let helpers = Object.assign(this.state, this.props);
        helpers.updatePrice = self.updatePrice;
        //Gets a token to populate token_id for instance request
        if (!isAuthorized({permissions: "can_administrate"}) &&
            this.state.servicePrice > 0 &&
            !this.state.hasCard && initialValues.trial_period_days <= 0) {
            submissionPrep = this.submissionPrep;
        }

        return (
            <div>
                {(!this.state.hasCard &&
                    !isAuthorized({permissions: "can_administrate"})) &&
                ((this.state.servicePrice > 0 && initialValues.trial_period_days <= 0) ||
                    (this.state.templateData.type === 'split')) &&
                <CardSection/>}


                <ServiceBotBaseForm
                    form={ServiceRequestForm}
                    initialValues={initialValues}
                    initialRequests={initialRequests}
                    submissionPrep={submissionPrep}
                    submissionRequest={submissionRequest}
                    successMessage={successMessage}
                    successRoute={successRoute}
                    handleResponse={this.handleResponse}
                    formName="serviceInstanceRequestForm"
                    helpers={helpers}
                    validations={this.formValidation}
                    loaderTimeout={false}
                />
            </div>
        )

    }
}

ServiceInstanceForm = injectStripe(ServiceInstanceForm);


class FormWrapper extends React.Component {

    render() {
        let spk = cookie.load("spk");
        return (
            <StripeProvider apiKey={spk || "no_public_token"}>
                <Elements>
                    <ServiceInstanceForm {...this.props}/>
                </Elements>
            </StripeProvider>

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


export default connect(mapStateToProps, mapDispatchToProps)(FormWrapper);

