import React from 'react';
import Load from '../../utilities/load.jsx';
import cookie from 'react-cookie';
import Fetcher from "../../utilities/fetcher.jsx"
import Buttons from "../../elements/buttons.jsx";
import Alerts from "../alerts.jsx";
let _ = require("lodash");
import Inputs from "../../utilities/inputs.jsx";

class BillingSettingForm extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        if(this.props.ownerId){
            uid = this.props.ownerId;
        }else if(this.props.forUID){
            uid = this.props.forUID;
        }
        let username = cookie.load("username");
        let spk = cookie.load("spk");
        let stripe = Stripe(spk);
        let elements = stripe.elements();
        this.state = {  loading: true,
                        uid: uid,
                        email: username,
                        spk: spk,
                        hasCard: false,
                        fund: {},
                        card: {},
                        personalInformation: {},
                        stripe: stripe,
                        elements: elements,
                        stripeCard: null,
                        success: false,
                        context: this.props.context || "PAGE_BILLING_SETTINGS"
                    };
        this.getStripeToken = this.getStripeToken.bind(this);
        this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
        this.addStripeEventListener = this.addStripeEventListener.bind(this);
        this.handleStripeResponse = this.handleStripeResponse.bind(this);
        this.checkIfUserHasCard = this.checkIfUserHasCard.bind(this);
        this.handleStripeOptionsInputChange = this.handleStripeOptionsInputChange.bind(this);
    }

    checkIfUserHasCard(){
        let self = this;
        Fetcher(`/api/v1/users/${self.state.uid}`).then(function (response) {
            if(!response.error){
                console.log("current state's uid", response);
                if(_.has(response, 'references.funds[0]') && _.has(response, 'references.funds[0].source.card')){
                    let fund = _.get(response, 'references.funds[0]');
                    let card = _.get(response, 'references.funds[0].source.card');
                    console.log("found card in response", card);
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
                        console.log("checked user and found card, state is set to", self.state);
                    });
                }
            }else{
                self.setState({loading: false, hasCard: false});
            }
        });
    }

    componentDidMount(){
        //check if user has card first
        this.checkIfUserHasCard();

        //then do the stripe stuff
        let self = this;
        let elements = self.state.elements;

        let style = {
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
        };

        // Create an instance of the card Element
        var card = elements.create('card', {style: style});
        // Add an instance of the card Element into the `card-element` <div>
        card.mount('#card-element');
        // listen to change events on the card Element and display any errors
        card.addEventListener('change', function(event) {
            var displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

        // Store the card instance in self.state for later use
        self.setState({stripeCard: card}, function () {
            self.addStripeEventListener();
        });


        if(this.props.setCardElement){
            this.props.setCardElement(card);
        }

        if(this.props.retrieveStripeToken){
            let form = document.getElementById('payment-form');
            console.log("giving the stripe form to request form");
            this.props.retrieveStripeToken(form, null);
        }
    }

    addStripeEventListener(){
        // Create a token or display an error the form is submitted.
        let self = this;
        let stripe = self.state.stripe;
        let card = self.state.stripeCard;

        let form = document.getElementById('payment-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("got submit event, personal information", self.state.personalInformation);
            stripe.createToken(card, self.state.personalInformation).then(function(result) {
                if (result.error || result.err) {
                    // Inform the user if there was an error
                    self.setState({ajaxLoad: false}, function(){
                        let errorElement = document.getElementById('card-errors');
                        errorElement.textContent = result.error.message || result.err;
                        console.log("get token error",result);
                    });
                } else {
                    // Send the token to your server
                    if(self.props.retrieveStripeToken){
                        self.props.retrieveStripeToken(form, result.token);
                    }else{
                        console.log("else result token, use stripe token handler");
                        self.stripeTokenHandler(result.token);
                    }
                }
            });
        });
    }

    getStripeToken(){
        this.setState({ajaxLoad: true}, function(){
            let form = document.getElementById('payment-form');
            form.dispatchEvent(new Event('submit', {'bubble': true}));
        });
    }

    stripeTokenHandler(token) {
        let self = this;
        let uid = self.state.uid;
        let hasCard = self.state.hasCard;
        let fundID = self.state.fund.id;
        let apiMethod = 'POST';
        let apiURL = '/api/v1/funds';
        let myTokenJSON = {'user_id': uid, 'token_id': token.id};

        // send the token off to db
        Fetcher(apiURL, apiMethod, myTokenJSON).then(function (response) {
            self.setState({ajaxLoad: false});
            if(!response.error && !response.err){
                console.log(response);
                self.handleStripeResponse(response);
            }else{
                console.log("stripe error", response);
                console.log("card error", response);
                self.setState({
                    alerts: {
                        type: 'danger',
                        message: response.err ? response.err.err ? response.err.err : response.err : response.error || response,
                        icon: 'exclamation-circle'}
                });
            }
        });
    }

    handleStripeResponse(response){
        let self = this;
        console.log("added fund response", response);
        self.setState({hasCard: true, success: true, alerts: {type: 'success', message: 'Your card has been added', icon: ''}}, function () {
            this.checkIfUserHasCard();
        });

        if(self.props.modalCallback){
            console.log('has modal callback function');
            self.props.modalCallback(response);
        }
    }

    handleStripeOptionsInputChange(){
        console.log('calling handleStripeOptionsInputChange');

        let self = this;

        let name = document.getElementsByName('name')[0].value;
        let address_line1 = document.getElementsByName('address_line1')[0].value;
        let address_line2 = document.getElementsByName('address_line2')[0].value;
        let address_city = document.getElementsByName('address_city')[0].value;
        let address_state = document.getElementsByName('address_state')[0].value;

        this.setState({
                personalInformation: {
                    'name': name,
                    'address_line1': address_line1,
                    'address_line2': address_line2,
                    'address_city': address_city,
                    'address_state': address_state
                }
            }
        , function(){
            console.log(self.state.personalInformation);
        });

    }

    render(){
        let self = this;

            let hasCard = self.state.hasCard;
            let success = self.state.success;
            let brand, last4, exp_month, exp_year = '';
            if(hasCard) {
                //user has a credit card in our database, load card info and let user edit.
                brand = self.state.card.brand;
                last4 = self.state.card.last4;
                exp_month = self.state.card.exp_month;
                exp_year = self.state.card.exp_year;
            }

            let {user} = this.props;

            if(this.state.context === "PAGE_BILLING_SETTINGS") {

                let displayName = user && (user.id || user.email) || "You";

                return (
                    <div>
                        { self.state.alerts &&
                        <Alerts type={self.state.alerts.type} message={self.state.alerts.message}
                                icon={self.state.alerts.icon}/>
                        }

                        {hasCard &&
                        <div>
                            <h3>{hasCard && !success ? `${displayName} have` : 'Added'} a {brand} card in your account
                                    ending in <span className="last4">{last4}</span></h3>

                            <p>Expiration: <span className="exp_month">{exp_month}</span> / <span
                                className="exp_year">{exp_year}</span></p>

                            <hr/>

                            {(hasCard && !success) && <p>Would you like to update {displayName} current payment method?</p>}
                        </div>
                        }

                        <form id="payment-form">
                            <div className="form-row">
                                <label htmlFor="card-element">Credit or debit card</label>
                                <div className="p-20 form-group" id="card-element"></div>
                                <div id="card-errors"></div>
                            </div>

                            {!this.state.loading &&
                                <div>
                            <Inputs type="text" label="Name" name="name"
                                    defaultValue={this.state.personalInformation.name}
                                    onChange={this.handleStripeOptionsInputChange}/>
                            < Inputs type="text" label="Address Line 1" name="address_line1"
                                defaultValue={this.state.personalInformation.address_line1}
                                onChange={this.handleStripeOptionsInputChange}/>
                                <Inputs type="text" label="Address Line 2" name="address_line2"
                                defaultValue={this.state.personalInformation.address_line2}
                                onChange={this.handleStripeOptionsInputChange}/>
                                <Inputs type="text" label="City" name="address_city"
                                defaultValue={this.state.personalInformation.address_city}
                                onChange={this.handleStripeOptionsInputChange}/>
                                <Inputs type="text" label="State" name="address_state"
                                defaultValue={this.state.personalInformation.address_state}
                                onChange={this.handleStripeOptionsInputChange}/>
                                </div>
                            }
                            <Buttons btnType="primary"
                                     text={hasCard ? 'Update Payment Method' : 'Add Payment Method'}
                                     preventDefault={false}
                                     onClick={this.getStripeToken}
                                     loading={this.state.ajaxLoad}
                                     success={this.state.success}
                                     disabled={this.state.ajaxLoad}/>
                        </form>
                    </div>
                );
            }else if(this.state.context === "SERVICE_REQUEST"){
                return(
                    <div>
                        <form id="payment-form">
                            <div className="form-row">
                                <label htmlFor="card-element">Credit or debit card</label>
                                <div className="p-20 form-group" id="card-element"></div>
                                <div id="card-errors"></div>
                            </div>
                        </form>
                    </div>
                );
            }else{
                return(
                    <div>PLEASE MAKE SURE YOUR CONTEXT IS CORRECT</div>
                )
            }

    }
}

export default BillingSettingForm;
