import React from 'react';
import {Elements, injectStripe, CardElement, StripeProvider} from 'react-stripe-elements';
import Fetcher from "../../utilities/fetcher.jsx"
import {get, has} from "lodash";
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import {inputField} from "./servicebot-base-field.jsx";
import Alerts from '../alerts.jsx';
import {required} from 'redux-form-validators'
import {Field,} from 'redux-form'
import Collapsible from 'react-collapsible';
import Buttons from "../buttons.jsx";

class CardSection extends React.Component {
    render() {
        return (
            <div className="form-group" id="card-element">
                <CardElement style={{
                    base: {
                        color: '#32325d',
                        lineHeight: '24px',
                        fontFamily: 'Helvetica Neue',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#aab7c4'
                        }
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }}/>
            </div>
        );
    }
}

class BillingForm extends React.Component {
    render() {
        if(!this.props.spk) {
            return (
                <div>Loading</div>
            )
        }
        return (
            <StripeProvider apiKey={this.props.spk}>
                <Elements id="payment-form">
                    <CreditCardForm {...this.props}/>
                </Elements>
            </StripeProvider>

        )
    }
}

function BillingInfo(props) {
    return (
        <form>
            <CardSection/>
            <Field name="name" type="text" component={inputField} placeholder="Name on the card"/>
            <Field name="address_line1" type="text" component={inputField} placeholder="Address"/>
            <Field name="address_city" type="text" component={inputField} placeholder="City"/>
            <Field name="address_state" type="text" component={inputField} placeholder="State"/>
            {/*<button type="submit">Submit</button>*/}
            <div className="text-right">
                <Buttons btnType="primary" text="Save Card" onClick={props.handleSubmit} type="submit" value="submit"/>
            </div>
        </form>
    )
}

class CreditCardForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCard: false,
            loading: true,
            card: {},
            alerts: null,
            showForm: false
        };
        this.submissionPrep = this.submissionPrep.bind(this);
        this.checkIfUserHasCard = this.checkIfUserHasCard.bind(this);
        this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
        this.handleFailureResponse = this.handleFailureResponse.bind(this);
        this.showPaymentForm = this.showPaymentForm.bind(this);
        this.hidePaymentForm = this.hidePaymentForm.bind(this);
    }

    componentDidMount() {
        let self = this;
        if (self.props.uid) {
            self.checkIfUserHasCard();
        } else if(self.props.userFund) {
            let fund = self.props.userFund;
            let card = fund.source.card;
            self.setState({
                loading: false,
                hasCard: true,
                fund: fund,
                card: card,
                personalInformation: {
                    name: card.name,
                    address_line1: card.address_line1,
                    address_city: card.address_city,
                    address_state: card.address_state,
                }
            }, function () {
            });
        } else {
            self.setState({
                loading: false,
                hasCard: false,
                showForm: true
            });
        }
    }

    async submissionPrep(values) {
        let token = await this.props.stripe.createToken({...values});
        console.log(token);
        if (token.error) {
            let message = token.error;
            if(token.error.message) {
                message = token.error.message;
            }
            this.setState({ alerts: {
                type: 'danger',
                icon: 'times',
                message: message
            }});
            throw token.error
        }
        return {user_id: this.props.uid, token_id: token.token.id};
    }

    checkIfUserHasCard() {
        let self = this;
            Fetcher(`/api/v1/users/${self.props.uid}`).then(function (response) {
                if (!response.error) {
                    if (has(response, 'references.funds[0]') && has(response, 'references.funds[0].source.card')) {
                        let fund = get(response, 'references.funds[0]');
                        let card = get(response, 'references.funds[0].source.card');
                        self.setState({
                            loading: false,
                            displayName: response.name || response.email || "You",
                            hasCard: true,
                            fund: fund,
                            card: card,
                            personalInformation: {
                                name: card.name || "",
                                address_line1: card.address_line1 || "",
                                address_city: card.address_city || "",
                                address_state: card.address_state || "",
                            }
                        }, function () {
                        });
                    } else {
                        self.setState({
                            loading: false,
                            showForm: true
                        });
                    }
                } else {
                    self.setState({loading: false, hasCard: false});
                }
            });
    }

    handleSuccessResponse(response) {
        //If the billing form is passed in a callback, call it.
        if(this.props.handleResponse) {
            this.props.handleResponse(response);
        //Otherwise, set own alert.
        } else {
            this.setState({ alerts: {
                type: 'success',
                icon: 'check',
                message: 'Your card has been updated.'
            }});
            //re-render
            this.checkIfUserHasCard();
        }

    }

    handleFailureResponse(response) {
        if (response.error) {
            this.setState({ alerts: {
                type: 'danger',
                icon: 'times',
                message: response.error
            }});
        }
    }

    showPaymentForm(){
        this.setState({ showForm: true });
    }

    hidePaymentForm(){
        this.setState({ showForm: false });
    }

    render() {
        let submissionRequest = {
            'method': 'POST',
            'url': `/api/v1/funds`
        };

        if(this.props.submitAPI) {
            submissionRequest.url = this.props.submitAPI;
        }



        let {hasCard, displayName, card: {brand, last4, exp_month, exp_year}} = this.state;

        let getBrandIcon = ()=>{
            if(brand === 'American Express'){
                return 'fa fa-cc-amex';
            }else{
                return `fa fa-cc-${brand.replace(/\s+/g, '-').toLowerCase()}`;
            }
        };

        let getCard = ()=>{
            if(hasCard) {
                return (
                    <div className="card-accordion">
                        <p>
                            <i className={getBrandIcon()}/>
                            {brand} ending in <span className="last4">{last4}</span>
                            <span className="exp_month">{exp_month}</span> /
                            <span className="exp_year">{exp_year}</span>
                        </p>
                    </div>
                )
            }else{
                return (
                    <div className="card-accordion">
                        <p>
                            <i className="fa fa-plus"/>
                            <span>Add your card</span>
                        </p>
                    </div>
                )
            }
        };

        let getAlerts = ()=>{
            if(this.state.alerts){
                return ( <Alerts type={this.state.alerts.type} message={this.state.alerts.message}
                                 position={{position: 'fixed', bottom: true}} icon={this.state.alerts.icon} /> );
            }
        };

        return (
            <div id="payment-form">
                <h3><i className="fa fa-credit-card"/>Your credit/debit card</h3>
                <hr/>
                <div className="form-row">
                    {hasCard && <p>You can update your payment method by clicking on Update Payment.</p>}
                    {getAlerts()}
                    <div className="service-instance-box navy">
                        <div className="service-instance-box-title">
                            {getCard()}
                            <div className="pull-right">
                                {!this.state.showForm ?
                                    <button className="btn btn-default btn-rounded btn-sm m-r-5 application-launcher" onClick={this.showPaymentForm}>Update Payment</button>
                                    :
                                    <button className="btn btn-default btn-rounded btn-sm m-r-5 application-launcher" onClick={this.hidePaymentForm}>Cancel</button>
                                }

                            </div>
                        </div>
                        {this.state.showForm &&
                            <div className="service-instance-box-content">
                                <ServiceBotBaseForm
                                    form={BillingInfo}
                                    initialValues={{...this.state.personalInformation}}
                                    submissionPrep={this.submissionPrep}
                                    submissionRequest={submissionRequest}
                                    successMessage={"Fund added successfully"}
                                    handleResponse={this.handleSuccessResponse}
                                    handleFailure={this.handleFailureResponse}
                                    reShowForm={true}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

CreditCardForm = injectStripe(CreditCardForm);

export {CreditCardForm, BillingForm, CardSection};
