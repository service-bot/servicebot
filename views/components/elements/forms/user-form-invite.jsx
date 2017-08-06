import React from 'react';
import Load from '../../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import {DataForm} from "../../utilities/data-form.jsx";
import {setUid, fetchUsers, setUser} from "../../utilities/actions";
import {connect} from "react-redux";
import cookie from 'react-cookie';
import Inputs from '../../utilities/inputs.jsx';
let _ = require("lodash");

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
        if (!response.error) {
            localStorage.setItem("permissions", response.permissions);
            this.props.setUid(cookie.load("uid"));
            this.props.setUser(cookie.load("uid"));
            this.setState({success: true});
            if (this.props.location.state && this.props.location.state.fromLogin) {
                return browserHistory.go(-2);
            }
            browserHistory.goBack();
        }
    }

    getValidators() {
        //optional references: the service template's references.service_template_properties
        //Defining general validators
        let validateEmail = (val) => {
            let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            console.log("validating email", val.match(mailFormat));
            return val.match(mailFormat) ? true : {error:"Invalid email format"};

        };
        let validatorJSON = {
            'email': validateEmail
        };
        return validatorJSON;
    }

    render() {

        if (this.state.loading) {
            return ( <Load/> );
        } else if (this.state.success) {
            browserHistory.goBack();
        } else {
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="sign-up">
                    {/*<span>test {this.state.token}</span>*/}
                    <DataForm validators={this.getValidators()} handleResponse={this.handleResponse} url={this.state.url} method={'POST'}>

                        <div>
                            <h3 className="m-b-20">Finish Your Invitation</h3>
                            <p>Please enter your information to finish the invitation</p>
                        </div>
                        <div className="form-group">
                            <label className="control-label">Name</label>
                            <input type="text" name="name" className="form-control"/>
                            <span className="bmd-help">Please enter your name</span>
                        </div>
                        <div className="form-group">
                            <label className="control-label">Phone Number</label>
                            <input type="text" name="phone" className="form-control"/>
                            <span className="bmd-help">Please enter your phone number</span>
                        </div>
                        <div className="form-group">
                            <label className="control-label">Password</label>
                            <input type="password" name="password" className="form-control"/>
                            <span className="bmd-help">Please enter your password</span>
                        </div>
                        <div className="agreement-checkbox checkbox">
                            <label>
                                <input name="agree" type="checkbox"/>
                                By clicking on create account, you agree to our terms of service and that you have read
                                our
                                privacy policy,
                                including our cookie use policy
                            </label>
                        </div>
                        <button className="btn btn-raised btn-lg btn-primary btn-block" type="submit"
                                    value="submit">Finish</button>
                        <p className="copyright">&copy; Copyright 2017</p>

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
        }
    }
};

export default connect(null, mapDispatchToProps)(UserFormInvite);
