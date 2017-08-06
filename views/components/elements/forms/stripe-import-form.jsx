import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Inputs from "../../utilities/inputsV2.jsx";
import { formBuilder } from "../../utilities/form-builder";
import Buttons from "../buttons.jsx";
import Alerts from '../alerts.jsx';
class SystemSettingsForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            formURL: `/api/v1/stripe/import`,
            stripe_settings: false,
            loading: false,
            confirm_modal: false,
            ajaxLoad: false,
            success: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
    }
    handleSubmission(){

        let self = this;
        let payload = self.props.formData; // this formData object came from Redux store
        self.setState({ajaxLoad: true});
        Fetcher(this.state.formURL, 'POST', payload).then(function (response) {
            if (!response.error) {
                console.log("updated", response);
                self.setState({ajaxLoad: false, success: true, updatedUser: response.results.data}); //change the last one to what u are doing
            }else {
                console.log(`Server Error:`, response.error);
                self.setState({ajaxLoad: false});
            }
        });
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
                                    <div className="stripe-import-form">
                                        <div className="p-20">
                                            {/* Define Inputs */}
                                            <Inputs type="boolean" label="Notify Users" name="notifyUsers" defaultValue={false}/>
                                        </div>
                                        <Buttons containerClass="inline" size="md" btnType="danger" text="Import Stripe Data" value="submit" onClick={this.handleSubmission} loading={this.state.ajaxLoad}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const FORM_NAME = "stripeImportForm";

export default formBuilder(FORM_NAME)(SystemSettingsForm)