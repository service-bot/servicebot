import React from 'react';
import {Link, browserHistory} from 'react-router';
import Fetcher from "../../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Alert from 'react-s-alert';

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {}
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);


    }

    handleLogin(e){
        console.log(e);
        e.preventDefault();
        let that = this;

        Fetcher("/api/v1/auth/session", "POST", that.state.form).then(function(result){
            if(!result.error) {
                console.log(result);
                localStorage.setItem("permissions", result.permissions);
                if(that.props.location.state && that.props.location.state.fromSignup){
                    return browserHistory.go(-2);
                }
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
                <Alert stack={{limit: 3}} position='bottom'/>
                <form className="sign-in">
                    {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                    <h3>User Login</h3>
                    <p>
                        Please enter your email address and password to login
                    </p>
                    <div className="form-group">
                        <label htmlFor="sign-in-2-email" className="bmd-label-floating">Email address</label>
                        <input onChange={this.handleInputChange} id="email" type="text" name="email" className="form-control"/>
                            <span className="bmd-help">Please enter your email</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sign-in-1-password" className="bmd-label-floating">Password</label>
                        <input onChange={this.handleInputChange}  id="password" type="password" name="password" className="form-control"/>
                            <span className="bmd-help">Please enter your password</span>
                    </div>
                    <button onClick={this.handleLogin} type='submit' className="btn btn-raised btn-lg btn-primary btn-block">Sign in</button>
                    <p className="sign-up-link">Don't have an account?
                        <Link to={{pathname:"/signup", state:{fromLogin: true}}}>Sign up here</Link> or
                        <Link to={{pathname:"/forgot-password", state:{fromLogin: false}}}> Forgot Password</Link> </p>
                </form>
            </Authorizer>
        );
    }
}

export default Login;
