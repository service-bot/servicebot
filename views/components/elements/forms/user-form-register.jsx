import React from 'react';
import Load from '../../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import {DataForm} from "../../utilities/data-form.jsx";
import {setUid, fetchUsers, setUser} from "../../utilities/actions";
import {connect} from "react-redux";
import cookie from 'react-cookie';
import Inputs from '../../utilities/inputs.jsx';
let _ = require("lodash");

class UserFormRegister extends React.Component {

    constructor(props) {
        super(props);
        let token = this.props.token;
        this.state = {
            token: token,
            url: token ? `/api/v1/users/register?token=${token}` : `/api/v1/users/register`,
            loading: false,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getValidators = this.getValidators.bind(this);
    }

    handleResponse(response) {
        // console.log("inside handle response", response);
        if (!response.error) {
            localStorage.setItem("permissions", response.permissions);
            this.props.setUid(cookie.load("uid"));
            this.props.setUser(cookie.load("uid"));
            this.setState({success: true});

            // console.log("LOCATION!", that.props.location);
            if (this.props.location.state && this.props.location.state.fromLogin) {
                return browserHistory.go(-2);
            }
            browserHistory.goBack();
        }
    }

    getValidators() {
        //optional references: the service template's references.service_template_properties
        //Defining general validators
        let isEmpty = (val) =>{ return val === '' || typeof(val) === 'undefined'};
        //Defining field validators
        let validateEmail = (val) => {
            let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if(isEmpty(val)){
                return {error: "Email is required!"};
            }else if(!val.match(mailFormat)){
                return {error: "Invalid email format!"};
            }else{
                return true;
            }
        };
        let validateName = (val) => {
            console.log("validating name", val);
            if(isEmpty(val)){
                return {error: "Name is required!"};
            }else{
                return true;
            }
        };
        let validatePhone = (val) => {
            console.log("validating phone", val);
            if(isEmpty(val)){
                return {error: "Phone is required!"};
            }else{
                return true;
            }
        };
        let validatePassword = (val) => {
            if(isEmpty(val)){
                return {error: "Password is required!"};
            }else{
                return true;
            }
        };


        let validatorJSON = {
            'name': validateName,
            'phone': validatePhone,
            'email': validateEmail,
            'password': validatePassword
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
                    <DataForm validators={this.getValidators()} handleResponse={this.handleResponse} url={this.state.url} method={'POST'}>

                        {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                        {this.state.token ?
                            <div>
                                <h3 className="m-b-20">Finish Your Invitation</h3>
                                <p>Please enter your information to finish the invitation</p>
                            </div> :
                            <div>
                                <h3 className="m-b-20">Sign up</h3>
                                <p>Please enter your email address and password to create your account</p>
                            </div>
                        }

                        <Inputs type="text" name="name" label="Name" onChange={function () {}} receiveOnChange={true} receiveValue={true}/>
                        <Inputs type="text" name="phone" label="Phone Number" onChange={function () {}} receiveOnChange={true} receiveValue={true}/>

                        {!this.state.token &&
                            <Inputs type="email" name="email" label="Email Address" onChange={function () {}} receiveOnChange={true} receiveValue={true}/>
                        }

                        <Inputs type="password" name="password" label="Password" onChange={function () {}} receiveOnChange={true} receiveValue={true}/>

                        <div className="agreement-checkbox checkbox">
                            <label>
                                <input name="agree" type="checkbox"/>
                                By clicking on create account, you agree to our terms of service and that you have read
                                our
                                privacy policy,
                                including our cookie use policy
                            </label>
                        </div>

                        {!this.state.token ?
                            <div>
                                <button className="btn btn-raised btn-lg btn-primary btn-block" type="submit"
                                        value="submit">Sign Up
                                </button>
                                <p className="sign-up-link p-t-15">I have an account <Link className="sign-up-link"
                                                                                           to={{
                                                                                               pathname: "/login",
                                                                                               state: {fromSignup: true}
                                                                                           }}>Login Here</Link></p>
                            </div> :

                            <button className="btn btn-raised btn-lg btn-primary btn-block" type="submit"
                                    value="submit">
                                Finish</button>
                        }
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

export default connect(null, mapDispatchToProps)(UserFormRegister);
