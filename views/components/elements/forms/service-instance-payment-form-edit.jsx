import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";
import Alerts from "../alerts.jsx";

class ServiceInstanceFormEdit extends React.Component {

    constructor(props){
        super(props);
        let instance = this.props.myInstance;
        this.state = {
            instance: instance,
            loading: false,
            success: false,
            alert: {},
            countDown: 5
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleCountDownClose = this.handleCountDownClose.bind(this);
        this.getValidators = this.getValidators.bind(this);
    }

    handleResponse(response){
        if(!response.error && response.type != 'StripeInvalidRequestError'){
            this.setState({success: true, submitting: false});
        }else{
            if(response.type == "StripeInvalidRequestError"){
                if(response.message == "This customer has no attached payment source"){
                    this.setState({alert: {type: 'danger', message: 'This customer has no attached payment source.', icon: 'exclamation-circle'}});
                }else{
                    this.setState({alert: {type: 'danger', message: 'Stripe error: invalid subscription.', icon: 'exclamation-circle'}});
                }
            }
        }
    }

    handleCountDownClose(){
        if(this.state.countDown <= 0){
            this.props.onHide();
        }else{
            this.setState({countDown: this.state.countDown - 1});
        }
    }

    getValidators(references = null){
        //This function dynamically generates validators depending on what custom properties the instance has.
        //optional references: the service template's references.service_template_properties
        //Defining general validators
        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateEmptyString     = (val) => { return val.trim() != ''};
        let validateNumber          = (val) => { return !isNaN(parseFloat(val)) && isFinite(val) };
        //Defining validators
        let validateTrialDay        = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field trial days is required and must be a number greater than or equal 0"}};
        let validateAmount          = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field amount is required and must be a number greater than or equal 0"}};
        let validateInterval        = (val) => { return (validateRequired(val) && (val == 'day' || val == 'week' || val == 'month' || val == 'year')) || {error:"Field interval must be day, week, month or year."}};
        let validateIntervalCount   = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 1) || {error:"Field interval count is required and must be a number greater than 0"}};

        let validatorJSON = {
            'trial_period_days' : validateTrialDay,
            'amount'            : validateAmount,
            'interval'          : validateInterval,
            'interval_count'    : validateIntervalCount,
        };


        return validatorJSON;
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            let self = this;

            setTimeout(function() {
                self.handleCountDownClose();
            }, 1000);

            return (<div>
                    <div className="p-20">
                        <p><strong>Success! your payment plan has been updated.</strong></p>
                    </div>
                    <div className="modal-footer text-right">
                        <Buttons btnType="default" text={`Close ${this.state.countDown}`} onClick={this.props.onHide}/>
                    </div>
                </div>
            );
        }else{
            const instance = this.state.instance;

            if(this.state.instance.payment_plan != null){
                const paymentPlan = this.state.instance.payment_plan;

                let getAlerts = ()=> {

                    if(this.state.alert.message){
                        return(
                            <Alerts type={this.state.alert.type} message={this.state.alert.message} icon={this.state.alert.icon}/>
                        );
                    }

                };

                return (
                    <div>
                        {getAlerts()}

                        <DataForm validators={this.getValidators(null)} handleResponse={this.handleResponse} url={`/api/v1/service-instances/${instance.id}/change-price`} method={'POST'}>

                            <div className="p-20">
                                <div className="row">
                                    <div className="basic-info col-md-12">
                                        <p><strong>Payment Plan For {instance.name}</strong></p>
                                        <p>{instance.description}</p>

                                        <Inputs type="hidden" name="name" value={paymentPlan.name}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                        <Inputs type="text" maxLength="22" name="statement_descriptor" label="Statement Descriptor" defaultValue={paymentPlan.statement_descriptor}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                        <Inputs type="number" name="trial_period_days" label="Trial Period (Days)" defaultValue={paymentPlan.trial_period_days != null ? paymentPlan.trial_period_days : 0}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                        <Inputs type="price" name="amount" label="Amount" defaultValue={paymentPlan.amount}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                        <Inputs type="select" name="interval" label="Interval" defaultValue={paymentPlan.interval}
                                                options={[{'Daily':'day'},{'Weekly':'week'},{'Monthly':'month'},{'Yearly':'year'}]}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                        {/*TODO: Stripe limits interval count to be 2 years*/}
                                        <Inputs type="number" name="interval_count" label="Interval Count" defaultValue={paymentPlan.interval_count}
                                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                    </div>
                                </div>
                            </div>

                            <div id="request-submission-box" className="modal-footer text-right">
                                <Buttons containerClass="inline" btnType="primary" text="Submit" type="submit" value="submit"/>
                                <Buttons containerClass="inline" btnType="default" text="Close" onClick={this.props.onHide}/>
                            </div>

                        </DataForm>
                    </div>
                );
            }else{
                return( <div>
                            <div className="p-20">
                               <p><strong>You do not have a payment plan setup.</strong></p>
                            </div>
                            <div id="request-submission-box" className="modal-footer text-right">
                                <Buttons btnType="default" text="Close" onClick={this.props.onHide}/>
                            </div>
                        </div>
                );
            }


        }
    }
}

export default ServiceInstanceFormEdit;
