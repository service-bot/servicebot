import React from 'react';
import {Link, browserHistory} from 'react-router';
import Content from '../../layouts/content.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Load from "../../utilities/load.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Alert from 'react-s-alert';
import Buttons from '../buttons.jsx';
import {connect} from "react-redux";
import {setUid, setUser, fetchUsers, setVersion, addAlert, dismissAlert, setPermissions} from "../../utilities/actions";
import cookie from 'react-cookie';
let _ = require("lodash");

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {},
            invitationExists : this.props.invitationExists,
            alerts: [],
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.goToLogin = this.goToLogin.bind(this);

    }

    handleLogin(e){
        e.preventDefault();
        let self = this;

        Fetcher("/api/v1/auth/session", "POST", self.state.form).then(async function(result){
            if(!result.error) {

                localStorage.setItem("permissions", result.permissions);
                self.props.setPermissions(result.permissions);
                fetchUsers(cookie.load("uid"), (err, user) => (self.props.setUser(user)));

                //update redux store with the uid
                self.props.setUid(cookie.load("uid"));

                //update redux store with version number
                Fetcher("/api/v1/system-options/version").then(function (version) {
                    self.props.setVersion(version.version);
                });

                //if the user came from a modal, close the modal, else send user back 2 pages
                if(self.props.modal !== true) {
                    if (self.props.location.state && self.props.location.state.fromSignup) {
                        return browserHistory.go(-2);
                    } else if(result.permissions.includes("can_administrate", "can_manage")){
                        return browserHistory.push("/dashboard");
                    } else {
                        return browserHistory.push("/my-services");
                    }
                    //browserHistory.goBack();
                }else{
                    self.props.hide();
                }

                //if there was an alert in the state and store, dismiss it
                if(self.state.alerts.length){

                    const removedAlert = self.props.alerts.filter(alert => alert.id !== self.state.alerts[0].id);

                    self.props.dismissAlert(removedAlert);
                }

            }else{
                let loginErrorAlert = {id: '112', message: 'Your user name or password is not correct.', show: true};
                self.props.addAlert(loginErrorAlert);
                self.setState({errors: result.error, alerts: [ ...self.state.alerts, loginErrorAlert ]});
            }
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const formState = update(this.state, { form: {[name]: {$set: value}}});
        this.setState(formState);
    }

    componentWillUnmount(){
        document.body.classList.remove('login')
    }

    componentDidMount(){
        if(!isAuthorized({anonymous:true})){
            return browserHistory.push("/");
        }

        if(this.props.email){
            const formState = update(this.state, { form: {email: {$set: this.props.email}}});
            this.setState(formState);
        }

        document.body.classList.add('login')

    }

    componentDidUpdate(){
    }

    goToLogin(){
        this.setState({invitationExists: false});
    }

    render () {

        if(!this.props.options.allow_registration) {
            return( <Load/> );
        }else{
            if (this.props.modal && this.props.email) {
                return (
                    <Content primary={true}>
                        <div className="centered-box col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                            <form className="sign-in">
                                {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                                {this.state.invitationExists &&
                                <div>
                                    <h3 className="text-center">Account confirmation email is sent to {this.props.email}?</h3>
                                    <p>Please check your email to complete your account before continue.</p>
                                    <Buttons buttonClass="btn btn-link" size="md" position="center" btnType="link"
                                             value="submit"
                                             onClick={this.goToLogin}>
                                        <span>I already confirmed my account, continue.</span>
                                    </Buttons>
                                </div>
                                }

                                {!this.state.invitationExists &&
                                <div>
                                    <h3>Login as: {this.props.email}</h3>
                                    <p>Please login to continue</p>
                                    <div className={`form-group ${this.state.errors && 'has-error   '}`}>
                                        <input onChange={this.handleInputChange} id="password" type="password"
                                               name="password" className="form-control" placeholder="Password"/>
                                        {this.state.errors && <span className="help-block">{this.state.errors}</span>}
                                    </div>
                                    <button onClick={this.handleLogin} type='submit'
                                            className="btn btn-raised btn-lg btn-primary btn-block">Sign in
                                    </button>
                                    <p className="sign-up-link"><Link
                                        to={{pathname: "/forgot-password", state: {fromLogin: false}}}> Forgot
                                        Password</Link></p>
                                </div>
                                }
                            </form>
                        </div>
                    </Content>
                )
            } else {
                return (
                    <Authorizer anonymous={true}>
                        <Content primary={true}>
                            {/*<div className="left-panel col-md-6">adsf</div>*/}
                            <div className="centered-box col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                                <form className="sign-in">
                                    {/*<Alert stack={{limit: 3}} position='bottom'/>*/}
                                    {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                                    <h3>Login</h3>

                                    <div className="form-group">
                                        <input onChange={this.handleInputChange} id="email" type="text" name="email"
                                               defaultValue={this.props.email || ''} className="form-control" placeholder="Email Address"/>
                                    </div>
                                    <div className="form-group">
                                        <input onChange={this.handleInputChange} id="password" type="password"
                                               name="password" className="form-control" placeholder="Password"/>
                                    </div>
                                    <button onClick={this.handleLogin} type='submit'
                                            className="btn btn-raised btn-lg btn-primary btn-block">Sign in
                                    </button>
                                    <p className="sign-up-link">
                                        <Link to={{pathname: "/forgot-password", state: {fromLogin: false}}}> Forgot
                                            Password</Link>
                                    </p>
                                    {(this.props.options && this.props.options.allow_registration.value == 'true') &&
                                    <p className="sign-up-link">Don't have an account?
                                        <span><Link to={{
                                            pathname: "/signup",
                                            state: {fromLogin: true}
                                        }}> Sign up here</Link></span>
                                    </p>
                                    }
                                </form>
                            </div>
                        </Content>
                    </Authorizer>
                );
            }
        }
    }
}

function mapStateToProps(state){
    return {
        alerts : state.alerts,
        options: state.options
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUid: (uid) => {
            dispatch(setUid(uid))
        },
        setUser: (uid) => {
            dispatch(setUser(uid))
        },
        setVersion: (version) => {
            dispatch(setVersion(version))
        },
        addAlert: (alert) => {
            return dispatch(addAlert(alert))
        },
        dismissAlert: (alert) => {
            return dispatch(dismissAlert(alert))
        },
        setPermissions : permissions => dispatch(setPermissions(permissions))

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
