import React from 'react';
import Fetcher from '../../utilities/fetcher.jsx';
import ModalPaymentSetup from '../modals/modal-payment-setup.jsx';
import InfoToolTip from "../../elements/tooltips/info-tooltip.jsx";
import ToolTip from '../../elements/tooltips/tooltip.jsx';

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
        let trialExpires = '';

        let date_diff_indays = (date1, date2) => {
            let dt1 = new Date(date1);
            let dt2 = new Date(date2);
            return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
        }

        //Get service trial status
        let trial = self.state.instance.payment_plan.trial_period_days;
        if(self.state.instance.status === "running" && trial > 0 && self.props.userFunds.length === 0) {
            let currentDate = new Date();
            let trialEnd = new Date(self.state.instance.subscribed_at * 1000);
            trialEnd.setDate(trialEnd.getDate() + trial);
            //Service is trialing if the expiration is after current date
            if(currentDate < trialEnd) {
                inTrial = true;
                trialExpires = `Trial expires in ${date_diff_indays(currentDate, trialEnd)} days`;
            }
        }

        if(inTrial) {
            return (
                <span>
                    <ToolTip text="Add Fund" title={trialExpires} icon="fa-credit-card-alt" cssClass="btn-default btn-rounded btn-sm" onClick={self.props.modalCallback} />
                </span>

            );
        } else {
            return (null);
        }
    }
}

export default TrialFundAddition;
