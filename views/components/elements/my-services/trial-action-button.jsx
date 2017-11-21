import React from 'react';
import Fetcher from '../../utilities/fetcher.jsx';
import ModalPaymentSetup from '../modals/modal-payment-setup.jsx';

class TrialFundAddition extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            instance: this.props.serviceInstance
        };
    }

    render () {
        let self = this;
        let inTrial = false;

        let date_diff_indays = (date1, date2) => {
            let dt1 = new Date(date1);
            let dt2 = new Date(date2);
            return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
        }

        //Get service trial status
        let trial = self.state.instance.payment_plan.trial_period_days;
        if(self.state.instance.status === "running" && trial > 0 && self.props.userFunds.length === 0) {
            let currentDate = new Date(self.state.instance.subscribed_at * 1000);
            let trialEnd = new Date(self.state.instance.subscribed_at * 1000);
            trialEnd.setDate(trialEnd.getDate() + trial);
            //Service is trialing if the expiration is after current date
            if(currentDate < trialEnd) {
                inTrial = true;
                console.log("KGJ")
                console.log(date_diff_indays(currentDate, trialEnd));
            }
        }

        if(inTrial) {
            return (
                <div>
                    <button className="btn btn-default btn-rounded btn-sm m-l-5" onClick={self.props.modalCallback}><i className="fa fa-credit-card-alt" /> Add Fund</button>
                </div>

            );
        } else {
            return (null);
        }
    }
}

export default TrialFundAddition;
