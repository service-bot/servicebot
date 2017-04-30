import React from 'react';
import {Link, browserHistory} from 'react-router';
import Fetcher from "../../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";

class ForgotPassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {}
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleReset = this.handleReset.bind(this);

    }

    handleReset(e){
        console.log(e);
        e.preventDefault();
        let that = this;
        Fetcher("/api/v1/auth/reset-password", "POST", that.state.form).then(function(result){
            if(!result.error) {
                console.log(result);
                localStorage.setItem("permissions", result.permissions);
                browserHistory.goBack();
            }
        })
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
        return(
            <Authorizer anonymous={true}>
                <form className="sign-in">
                    {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                    <h3>Forgot Password</h3>
                    <p>
                        Please enter your email address to reset your password. You will receive an emil with password reset instructions.
                    </p>
                    <div className="form-group">
                        <label htmlFor="sign-in-2-email" className="bmd-label-floating">Email address</label>
                        <input onChange={this.handleInputChange} id="email" type="text" name="email" className="form-control"/>
                        <span className="bmd-help">Please enter your email</span>
                    </div>
                    <button onClick={this.handleReset} type='submit' className="btn btn-raised btn-lg btn-primary btn-block">Reset Password</button>
                    <p className="sign-up-link">Don't have an account? <Link to={{pathname:"/signup", state:{fromLogin: true}}}>Sign up here</Link></p>
                </form>
            </Authorizer>
        );
    }
}

export default ForgotPassword;
