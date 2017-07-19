import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
let _ = require("lodash");
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import Inputs from "../../utilities/inputs.jsx";
import Buttons from "../buttons.jsx";
import ModalConfirm from '../modals/modal-stripe-reconfigure.jsx';
import Alerts from '../alerts.jsx';

class SystemSettingsForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            stripe_get_keys: `/api/v1/stripe/keys`,
            stripe_preconfigure: `/api/v1/stripe/preconfigure`,
            stripe_configure: `/api/v1/stripe/reconfigure`,
            stripe_settings: false,
            loading: true,
            confirm_modal: false,
            ajaxLoad: false,
            success: false
        };
        this.fetchSettings = this.fetchSettings.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.onConfirmClose = this.onConfirmClose.bind(this);
    }

    componentDidMount(){
        this.fetchSettings();
    }

    fetchSettings(){
        let self = this;
        Fetcher(self.state.stripe_get_keys).then(function (response) {
            if(!response.error){
                console.log("stripe-settings", response);
                self.setState({loading: false, stripe_settings: response});
            }else{
                console.log("Stripe setting error", response);
                self.setState({loading: false});
            }
        });
    }

    handleResponse(response){
        let self = this;
        if(!response.error){
            if(response.do_migration) {
                this.setState({confirm_modal: true});
            }
        } else {
            self.setState({
                loading: false,
                confirm_modal: false,
                alerts: {
                    type: 'danger',
                    icon: 'times',
                    message: response.error
                }
            });
        }
    }

    handleConfirm(){
        let self = this;
        self.setState({
            loading : true
        });
        let fData = self.state.formData;
        Fetcher(self.state.stripe_configure, 'POST', JSON.parse(fData).form).then(function (response) {
            console.log(response)
            if(!response.error){

                console.log("stripe-settings", response);
                self.setState({
                    loading: false,
                    confirm_modal: false,
                    alerts: {
                        type: 'success',
                        icon: 'check',
                        message: 'Stripe API migration has successfully completed!'
                    }
                });
            }else{
                console.log("Stripe setting error", response);
                self.setState({
                    loading: false,
                    confirm_modal: false,
                    alerts: {
                        type: 'danger',
                        icon: 'times',
                        message: response.error
                    }
                });
            }
        });
    }
    onConfirmClose(){
        this.setState({ confirm_modal : false});
    }

    onUpdate(form){
        this.setState({formData: form});
    }

    render () {
        let self = this;
        let getAlerts = ()=>{
            if(self.state.alerts ){
                return ( <Alerts type={self.state.alerts.type} message={self.state.alerts.message}
                                 position={{position: 'fixed', bottom: true}} icon={self.state.alerts.icon} /> );
            }
        };

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success && false){
            return ( // this is disabled
                <div>
                    <div className="p-20">
                        <p><strong>Success! System settings has been updated.</strong></p>
                    </div>
                </div>
            );
        }else{
            const confirm_reconfigure = ()=>{
                if(self.state.confirm_modal){
                    return(
                        <ModalConfirm confirm={self.handleConfirm} hide={self.onConfirmClose}/>
                    );
                }
            };
            const settings = this.state.stripe_settings;
            return (
                <div className="row">
                    <div className="basic-info col-md-6 col-md-offset-3">
                        <div className="title">
                            <h3>Stripe API Key Reconfiguration</h3>
                            <p>
                                Be very careful with modifying your Stripe API keys. If the new Stripe API keys
                                belong to a different Stripe account, or different environment (eg. test to live),
                                ServiceBot will remove all subscription, invoices, and user funds, and will register
                                every user in the new Stripe account!
                            </p>
                            <p>
                                Follow these steps to change keys:<br/>
                                1. <a href="https://dashboard.stripe.com/register" target="_blank">Create a Stripe Account</a>. Note: If you already have a stripe account you can skip this step<br/>
                                2. Log in and go to <a href="https://dashboard.stripe.com/account/apikeys" target="_blank">the stripe api page</a>.<br/>
                                3. Ensure that your system is in the mode you want your ServiceBot to be in (Test or Live).<br/>
                                4. Copy and enter here the Publishable Key and Secret Key.<br/>
                                <a href="https://docs.servicebot.io/getting_started/" target="_blank">For more detailed instructions follow this link</a>.<br/>
                            </p>
                            <br/>
                        </div>
                        {getAlerts()}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row">
                                    <DataForm handleResponse={this.handleResponse} onUpdate={this.onUpdate} url={this.state.stripe_preconfigure} method={'POST'}>
                                        <div className="col-md-12">
                                            <Inputs type="text" label="Stripe Secret API Key" name="stripe_secret" defaultValue={settings.secret_key}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                            <Inputs type="text" label="Stripe Publishable API Key" name="stripe_public" value={settings.publishable_key}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                        </div>
                                        <div className="col-md-12 text-right">
                                            <Buttons btnType="primary" text="Update Stripe API Keys" type="submit" value="submit"/>
                                        </div>
                                    </DataForm>
                                </div>
                            </div>
                            {confirm_reconfigure()}
                        </div>
                        <p>
                            In order to have ServiceBot and Stripe communicate with each other we need to create webhooks in stripe. Follow these steps to enable this:<br/>
                            1. Login and navigate to <a href="https://dashboard.stripe.com/account/webhooks" target="_blank">the webhook page</a>.<br/>
                            2. In the section "Endpoints receiving events from your account" click "Add endpoint".<br/>
                            3. Copy your system url below and enter it in the "URL to be called" field.<br/>
                            <input className="form-control" value={`https://${window.location.hostname}/api/v1/stripe/webhook`} name="webhook-url" disabled/>
                            4. Select the mode chosen during the previous steps (Test or Live) and select "Send all event types".<br/>
                            5. Click "Add endpoint" and we have complete stripe set up.<br/>
                            <a href="https://docs.servicebot.io/getting_started/" target="_blank">For more detailed instructions follow this link</a>.<br/>
                        </p>
                    </div>
                </div>
            );
        }
    }
}

export default SystemSettingsForm;
