import React from 'react';
import {Elements, injectStripe, CardElement} from 'react-stripe-elements';


class CardSection extends React.Component {
    render() {
        return (
            <div className="p-20 form-group" id="card-element">

                <CardElement  style={{           base: {
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
                    }}} />
            </div>
        );
    }
};

class MyStoreCheckout extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        return (
                <form id="payment-form" onSubmit={this.handleSubmit}>
                    <div className="form-row">
                        <CardSection />
                    </div>
                </form>
        );
    }
}

export default MyStoreCheckout;
