import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Alerts from "../alerts.jsx";
import Buttons from "../buttons.jsx";
import Fetcher from '../../utilities/fetcher.jsx';
let _ = require("lodash");

import {required, email, numericality, length, confirmation} from 'redux-form-validators'
import {
    Field,
    FormSection,
    FieldArray,
    formValueSelector,
    getFormValues,
    change
} from 'redux-form'
import {inputField, selectField, widgetField, priceField, ServicebotBaseForm} from "servicebot-base-form";

let InviteUser = function(props){
    return <form onSubmit={props.handleSubmit}>
        <Field
            name={"email"}
            validate={[required(), email()]}
            component={inputField}
            type={"text"}
            label="Email"
        />
        <Field
            name={"name"}
            validate={[required()]}
            component={inputField}
            type={"text"}
            label="Name"
        />
        <Field name="password" type="password" component={inputField} label="Password" validate={[length({min: 8}), required()]}/>
        <Field name="password_confirmation" type="password" label="Password confirmation" component={inputField}
               validate={[confirmation({ field: 'password', fieldLabel: 'Password' })]} />
        <button className="buttons _primary submit-request" type="submit" value="submit">Create User</button>
    </form>
}
class InviteUserForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            url: `/api/v1/users/invite`,
            response: {},
            alerts: {},
            loading: false,
            success: false,
            toggle: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.reinviteUser = this.reinviteUser.bind(this);
    }

    handleResponse(response){
        if(!response.error){
            this.setState({toggle: !this.state.toggle});
        }else{
            this.setState({alerts: {type: 'danger', message: response.error}});
        }
    }

    reinviteUser(){
        let self = this;
        let email = self.props.reinviteEmail;
        Fetcher(self.state.url, 'POST', {"email": email}).then(function (response) {
            self.handleResponse(response);
        });
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div className="p-20">
                    <p><strong>User invited Successfully! The invitation link is listed below as well:</strong></p>
                    <div className="code green">{this.state.response.url || 'something went wrong.'}</div>
                </div>
            );
        }else{
            //If the reinvite UID props is passed, just run the invite
            if(this.props.reinviteEmail) {
                this.reinviteUser();
                return (null);
            } else {
                let submissionRequest = {
                    'method': 'POST',
                    'url': `/api/v1/users/create`
                };


                return (
                    <div className="invite-user-form" key={"form-" + this.state.toggle}>
                        <ServicebotBaseForm
                            form={InviteUser}
                            formName={"invite-form"}
                            submissionRequest={submissionRequest}
                            successMessage={"User Created"}
                            handleResponse={this.handleResponse}



                        />
                        <Buttons containerClass="inline" btnType="default" text="Later" onClick={this.props.hide} />
                    </div>
                );
            }

        }
    }
}

export default InviteUserForm;
