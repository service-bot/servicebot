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
            stripe_import: `/api/v1/stripe/import`,
            stripe_settings: false,
            loading: false,
            confirm_modal: false,
            ajaxLoad: false,
            success: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
    }

    handleResponse(response){
        let self = this;
        self.setState({
            loading : true
        });
        if(response){
            self.setState({
                loading: false,
                alerts: {
                    type: 'success',
                    icon: 'times',
                    message: 'All Stripe data has been imported successfully!'
                }
            });
        } else {
            self.setState({
                loading: false,
                alerts: {
                    type: 'danger',
                    icon: 'times',
                    message: response
                }
            });
        }
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
                        <p><strong>Success! Stripe data has been imported!</strong></p>
                    </div>
                </div>
            );
        }else{
            const settings = this.state.stripe_settings;
            return (
                <div className="row">
                    <div className="basic-info col-md-6 col-md-offset-3">
                        <div className="title">
                            <h3>Import Stripe Content</h3>
                            <p>
                                This action allows you to import all customers, funds, payment plans, and subscriptions
                                to ServiceBot with one click. Note that reversing this action can only be done manually.
                            </p>
                            <br/>
                        </div>
                        {getAlerts()}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row">
                                    <DataForm handleResponse={this.handleResponse} onUpdate={this.onUpdate} url={this.state.stripe_import} method={'POST'}>
                                        <div className="col-md-12 text-right">
                                            <Buttons btnType="danger" text="Import Stripe Data" type="submit" value="submit"/>
                                        </div>
                                    </DataForm>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default SystemSettingsForm;
