import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Fetcher} from "servicebot-base-form";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {setPermissions} from "../../utilities/actions";
import {connect} from "react-redux";
import ContentTitle from '../../layouts/content.jsx';
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
        e.preventDefault();
        let self = this;
        if (!self.state.form.email) {
            this.setState({submitted: self.state.submitted+1});
        }else{
            Fetcher("/api/v1/auth/reset-password", "POST", self.state.form).then(function (result) {
                if (!result.error) {
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
                <div className={`page __app-login-password-reset`}>
                    <Content>
                        <div className="login-container">
                            <div className="content-title"><h4>Password Reset Success</h4></div>
                            <p>Email Sent! You will receive an email with instructions to reset your password at <b>{this.state.form.email}</b></p>
                            <button onClick={() => {browserHistory.push("/login");}} type='submit'
                                    className="buttons _default">Back to Login</button>
                        </div>
                    </Content>
                </div>
            )
        }
        else {
            return (
                <Authorizer anonymous={true}>
                    <div className={`page __app-login-forgot-password`}>
                        <Content>
                            <div className="login-container">
                                <form className="forgot-password">
                                    <div className={`sb-form-group ${!this.state.form.email && this.state.submitted && 'has-error'}`}>
                                        <div className="content-title"><h4>Forot password</h4></div>
                                        <p>Please enter your email address to reset your password. You will receive an emil with password reset instructions.</p>
                                        <input onChange={this.handleInputChange} id="email" type="text" name="email" className="_input-" placeholder="Email Address"/>
                                        {!this.state.form.email && this.state.submitted ?
                                        <span className="help-block">Email is required</span> : <span/>}
                                    </div>
                                    <div className={`sb-form-group buttons-group __gap`}>
                                        <button className="buttons _default" onClick={this.handleReset} type='submit'>
                                            Reset Password </button>
                                        <Link className="buttons _default _text" to={{pathname: "/login", state: {fromLogin: true}}}>Back to Login</Link>
                                    </div>
                                </form>
                            </div>
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default connect(null, (dispatch => ({setPermissions : (permissions) => dispatch(setPermissions(permissions))})))(ForgotPassword);
