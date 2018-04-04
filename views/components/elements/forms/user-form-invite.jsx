import React from 'react';
import Load from '../../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import {DataForm} from "../../utilities/data-form.jsx";
import {setUid, fetchUsers, setUser, setPermissions} from "../../utilities/actions";
import {connect} from "react-redux";
import cookie from 'react-cookie';
import Inputs from '../../utilities/inputs.jsx';
import Alerts from '../alerts.jsx';

class UserFormInvite extends React.Component {

    constructor(props) {
        super(props);
        let token = this.props.token;
        this.state = {
            token: token,
            url: `/api/v1/users/register?token=${token}`,
            loading: false,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getValidators = this.getValidators.bind(this);
    }

    handleResponse(response) {
        let self = this;
        self.setState({
            loading : true
        });
        //Get the response
        if (!response.error) {
            localStorage.setItem("permissions", response.permissions);
            this.props.setPermissions(response.permissions);
            this.props.setUid(cookie.load("uid"));
            this.props.setUser(cookie.load("uid"));
            this.setState({
                success: true,
                loading: false,
                alerts: {
                    type: 'success',
                    icon: 'times',
                    message: 'You have successfully completed your account creation.'
                }
            });
            //If the user has admin rights, forward to dashboard, else to my services
            if(response.permissions.includes("can_adminstrate") || response.permissions.includes("can_manage")) {
                browserHistory.push('/dashboard');
            } else {
                browserHistory.push('/my-services');
            }
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

    getValidators() {
        let validateName = (val) => {
            return val ? true : {error:"Enter Full Name"};

        };
        let validatePassword = (val) => {
            return (val && val.length>=4) ? true : {error:"Password must be at least 4 characters"};

        };
        let validatorJSON = {
            'name': validateName,
            'password': validatePassword
        };
        return validatorJSON;
    }

    render() {
        let self = this;
        let getAlerts = ()=>{
            if(self.state.alerts){
                return ( <Alerts type={self.state.alerts.type} message={self.state.alerts.message}
                                 position={{position: 'fixed', bottom: true}} icon={self.state.alerts.icon} /> );
            }
        };
        if (this.state.loading) {
            return ( <Load/> );
        } else {
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="sign-up">
                    {getAlerts()}
                    <DataForm validators={this.getValidators()} handleResponse={this.handleResponse} url={this.state.url} method={'POST'}>
                        <div>
                            <h3 className="m-b-20">Finish Your Invitation</h3>
                            <p>Please enter your information to finish your registration and access your account.</p>
                        </div>
                        <div className="form-group">
                            <input type="text" name="name" placeholder="Full Name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <input type="password" name="password" placeholder="Password" className="form-control"/>
                        </div>
                        <button className="btn btn-raised btn-lg btn-primary btn-block" type="submit"
                                    value="submit">Finish Registration</button>
                    </DataForm>
                </div>
            );
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUid: (uid) => {
            dispatch(setUid(uid))
        },
        setUser: (uid) => {
            fetchUsers(uid, (err, user) => dispatch(setUser(user)));
        },
        setPermissions : permissions => dispatch(setPermissions(permissions))

    }
};

export default connect(null, mapDispatchToProps)(UserFormInvite);
