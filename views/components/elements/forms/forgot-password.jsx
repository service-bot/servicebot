import React from 'react';
import {Link, browserHistory} from 'react-router';
import Fetcher from "../../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Content from "../../layouts/content.jsx"

class ForgotPassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {},
            submitted: 0,
            success: false
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleReset = this.handleReset.bind(this);

    }

    handleReset(e) {
        console.log(e);
        e.preventDefault();
        let self = this;
        if (!self.state.form.email) {
            this.setState({submitted: self.state.submitted+1});
            console.log("email field is required", this.state.submitted);
        }else{
            Fetcher("/api/v1/auth/reset-password", "POST", self.state.form).then(function (result) {
                if (!result.error) {
                    console.log(result);
                    localStorage.setItem("permissions", result.permissions);
                    self.setState({success:true});
                }
            })
        }
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const formState = update(this.state, {
            form: {
                [name] : {$set:value}}
        });
        console.log(formState);
        this.setState(formState);
    }

    componentWillUnmount(){
        document.body.classList.remove('login')

    }

    componentDidMount(){
        if(!isAuthorized({anonymous:true})){
            return browserHistory.push("/");
        }

        document.body.classList.add('login')

    }
    render () {
        if(this.state.success){
            return (
                <Content>
                    <div className="centered-box col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                        <p>We sent you an email to reset your password at {this.state.form.email}</p>
                        <button onClick={() => {browserHistory.push("/login");}} type='submit'
                                className="btn btn-raised btn-lg btn-primary btn-block">Back to Login
                        </button>
                    </div>
                </Content>
            )
        }
        else {
            return (
                <Authorizer anonymous={true}>
                    <div className="centered-box col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                        <form className="sign-in">
                            {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                            <h3>Forgot Password</h3>
                            <p>
                                Please enter your email address to reset your password. You will receive an emil with
                                password reset instructions.
                            </p>
                            <div className={`form-group ${!this.state.form.email && this.state.submitted && 'has-error'}`}>
                                <label htmlFor="sign-in-2-email" className="bmd-label-floating">Email address</label>
                                <input onChange={this.handleInputChange} id="email" type="text" name="email"
                                       className="form-control"/>
                                {!this.state.form.email && this.state.submitted ?
                                <span className="help-block">Email is required</span> : <span/>}
                            </div>
                            <button onClick={this.handleReset} type='submit'
                                    className="btn btn-raised btn-lg btn-primary btn-block">Reset Password
                            </button>
                            <p className="sign-up-link">Don't have an account? <Link
                                to={{pathname: "/signup", state: {fromLogin: true}}}>Sign up here</Link></p>
                        </form>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default ForgotPassword;
