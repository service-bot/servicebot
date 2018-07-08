import React from 'react';
import Load from '../../utilities/load.jsx';
import {Fetcher} from "servicebot-base-form";
let _ = require("lodash");
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import Inputs from "../../utilities/inputs.jsx";
import Buttons from "../buttons.jsx";
import ModalConfirm from '../modals/modal-stripe-reconfigure.jsx';
import Alerts from '../alerts.jsx';
import {connect} from "react-redux";
import {setOption} from "../../utilities/actions";
import StripeImportForm from "../../elements/forms/stripe-import-form.jsx";


class SystemSettingsForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            stripe_get_keys: `/api/v1/stripe/keys`,
            stripe_preconfigure: `/api/v1/stripe/preconfigure`,
            stripe_configure: `/api/v1/stripe/reconfigure`,
            stripe_settings: false,
            stripe_initialize: false,
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
                //If this is the initialization, don't show the confirm modal
                if(response.secret_key === "" || !response.secret_key) {
                    self.setState({stripe_initialize: true});
                }
                self.setState({loading: false, stripe_settings: response});
            }else{
                self.setState({loading: false});
            }
        });
    }

    handleResponse(response){
        let self = this;
        if(!response.error){
            if(response.do_migration && !self.state.stripe_initialize) {
                this.setState({confirm_modal: true});
            } else {
                //Skip confirmation and apply keys
                self.handleConfirm(false);
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
        if(this.props.postResponse){
            this.props.postResponse();
        }
    }

    handleConfirm(){
        let self = this;
        self.setState({
            loading : true
        });
        let fData = self.state.formData;
        fData = JSON.parse(fData).form;
        if(!fData.full_removal){
            fData.full_removal = false;
        }
        Fetcher(self.state.stripe_configure, 'POST', fData).then(function (response) {
            if(!response.error){
                self.props.setKey(fData.stripe_public);
                self.fetchSettings();
                self.setState({
                    loading: false,
                    confirm_modal: false,
                    alerts: {
                        type: 'success',
                        icon: 'check',
                        message: 'Stripe API Keys were added successfully!'
                    }
                });
            }else{
                console.error("Stripe setting error", response);
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
                        <ModalConfirm confirm={self.handleConfirm} hide={self.onConfirmClose} formData={self.state.formData}/>
                    );
                }
            };
            const settings = this.state.stripe_settings;
            return (
                <div>
                    <div className="row">
                        <div className="basic-info col-md-12">
                            {settings.secret_key !== "" ?
                                <div className="title">
                                    <h3>Reconfigure Stripe API Keys</h3>
                                    <p>
                                        You can modify your Stripe keys to go from test to live, update to newer keys, or change to a different account. Retrieve your keys <a className="intext-link" href="https://dashboard.stripe.com/account/apikeys" target="_blank">from Stripe</a>. If you are changing from test to live or entering keys to a different account, you can choose to migrate data to a new Stripe account, or clear Servicebot data and start fresh.
                                    </p>
                                </div>
                                :
                                <div className="title">
                                    <h3>Add Stripe API Keys</h3>
                                    <p>
                                        Copy your Standard API keys <a className="intext-link" href="https://dashboard.stripe.com/account/apikeys" target="_blank">from Stripe</a> and paste them
                                        in the Secret key and Publishable key below. Once you enter your keys, you can import your Stripe account to your Servicebot.
                                    </p>
                                </div>
                            }

                            {getAlerts()}
                            <div className="stripe-keys-form row">
                                <div className="col-md-12">
                                    <div className="row">
                                        <DataForm handleResponse={this.handleResponse} onUpdate={this.onUpdate} url={this.state.stripe_preconfigure} method={'POST'}>
                                            <div className="col-md-12">
                                                <Inputs type="text" label="Stripe Publishable API Key" name="stripe_public" value={self.state.stripe_settings.publishable_key}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="text" label="Stripe Secret API Key" name="stripe_secret" value={self.state.stripe_settings.secret_key}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                                {self.state.stripe_settings.secret_key &&
                                                    <Inputs defaultValue="true" hideValue={true} type="select" label="Do you want to import existing customers to the new Stripe account? This option only applies if the new keys are related to a different Stripe account or if you are switching between Test/Live mode." name="full_removal"
                                                        options={[{"Reset Servicebot data and connect to the new Stripe account":true},{"Keep Servicebot data and import data to the new Stripe account":false}]} onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                                }
                                            </div>
                                            <div className="col-md-12 text-right">
                                                <Buttons btnType="primary" text="Update Stripe API Keys" type="submit" value="submit"/>
                                            </div>
                                        </DataForm>
                                    </div>
                                </div>
                                {confirm_reconfigure()}
                            </div>
                            {!self.props.initialize &&
                                <div>
                                    <hr/>
                                    <div className="stripe-webhook-setup">
                                        <div className="title">
                                            <h3>Connect to Stripe Webhooks</h3>
                                            <p>
                                                Copy your Servicebot webhook URL below and paste it as a new <a className="intext-link" href="https://dashboard.stripe.com/account/webhooks" target="_blank">Stripe endpoint</a> in your Stripe account.
                                            </p>
                                            <div className="stripe-webhook">{`https://${window.location.hostname}/api/v1/stripe/webhook`}</div>
                                        </div>
                                    </div>
                                    <hr/>
                                    {settings.secret_key !== "" && <StripeImportForm/> }
                                </div>
                            }

                        </div>
                    </div>
                </div>

            );
        }
    }
}

export default connect(null, dispatch => ({
    setKey: (publishableKey) => {
        return dispatch(setOption({option : "stripe_publishable_key", value : publishableKey, data_type : "hidden"}))
    }
}))(SystemSettingsForm);
