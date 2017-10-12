import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Alerts from "../alerts.jsx";
import Buttons from "../buttons.jsx";
let _ = require("lodash");

class InviteUserForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            url: `/api/v1/users/invite`,
            response: {},
            alerts: {},
            loading: false,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true, response: response});
        }else{
            this.setState({alerts: {type: 'danger', message: response.error}});
        }
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div className="p-20">
                    <p><strong>Invite Success!</strong></p>
                    <p>{this.state.response.url || 'something went wrong.'}</p>
                </div>
            );
        }else{
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="invite-user-form">
                    <DataForm handleResponse={this.handleResponse} url={this.state.url} method={'POST'}>

                        {(this.state.alerts && this.state.alerts.message) &&
                            <div>
                                <Alerts type={this.state.alerts.type} message={this.state.alerts.message}/>
                            </div>
                        }

                        <div className="p-20">
                            <p><strong>Please enter an email to invite a user to create an account</strong></p>
                            <Inputs type="text" name="email" label="Email Address"
                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                        </div>

                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" type="submit" value="submit" text="Invite User" success={this.state.success}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={this.props.hide} />
                        </div>
                    </DataForm>
                </div>
            );
        }
    }
}

export default InviteUserForm;
