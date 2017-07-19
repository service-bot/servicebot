import React from 'react';
import {Link, browserHistory} from 'react-router';
import Fetcher from "../../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Alert from 'react-s-alert';
import Buttons from '../buttons.jsx';
import {connect} from "react-redux";
import {setUid, setUser, fetchUsers} from "../../utilities/actions";
import cookie from 'react-cookie';

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {},
            invitationExists : this.props.invitationExists
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.goToLogin = this.goToLogin.bind(this);

    }

    handleLogin(e){
        e.preventDefault();
        let that = this;

        Fetcher("/api/v1/auth/session", "POST", that.state.form).then(function(result){
            if(!result.error) {

                localStorage.setItem("permissions", result.permissions);

                fetchUsers(cookie.load("uid"), (err, user) => (that.props.setUser(user)));

                //update redux store with the uid
                that.props.setUid(cookie.load("uid"));

                //if the user came from a modal, close the modal, else send user back 2 pages
                if(that.props.modal !== true) {
                    if (that.props.location.state && that.props.location.state.fromSignup) {
                        return browserHistory.go(-2);
                    }
                    browserHistory.goBack();
                }else{
                    that.props.hide();
                }
            }else{
                console.log("Login error", result.error);
                that.setState({errors: result.error});
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
            console.log("has email", this.props.email);
            const formState = update(this.state, { form: {email: {$set: this.props.email}}});
            this.setState(formState);
        }

        document.body.classList.add('login')

    }

    componentDidUpdate(){
        // console.log("updated state", this.state);
    }

    goToLogin(){
        this.setState({invitationExists: false});
    }

    render () {

        if(this.props.modal && this.props.email){
            return (
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
                            <input onChange={this.handleInputChange}  id="password" type="password" name="password" className="form-control"/>
                            <span className="bmd-help">Password</span>
                            {this.state.errors && <span className="help-block">{this.state.errors}</span>}
                        </div>
                        <button onClick={this.handleLogin} type='submit' className="btn btn-raised btn-lg btn-primary btn-block">Sign in</button>
                        <p className="sign-up-link"><Link to={{pathname:"/forgot-password", state:{fromLogin: false}}}> Forgot Password</Link> </p>
                    </div>
                    }
                </form>
            )
        }else{
            return(
                <Authorizer anonymous={true}>
                    <Alert stack={{limit: 3}} position='bottom'/>
                    <form className="sign-in">
                        {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                        <h3>User Login</h3>
                        <p>Please enter your email address and password to login</p>

                        <div className="form-group">
                            <label htmlFor="sign-in-2-email" className="bmd-label-floating">Email address</label>
                            <input onChange={this.handleInputChange} id="email" type="text" name="email" defaultValue={this.props.email || ''} className="form-control"/>
                            {!this.props.modal && <span className="bmd-help">Please enter your email</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="sign-in-1-password" className="bmd-label-floating">Password</label>
                            <input onChange={this.handleInputChange}  id="password" type="password" name="password" className="form-control"/>
                            <span className="bmd-help">Please enter your password</span>
                        </div>
                        <button onClick={this.handleLogin} type='submit' className="btn btn-raised btn-lg btn-primary btn-block">Sign in</button>
                        <p className="sign-up-link">Don't have an account?
                            <span><Link to={{pathname:"/signup", state:{fromLogin: true}}}>Sign up here</Link> or </span>
                            <Link to={{pathname:"/forgot-password", state:{fromLogin: false}}}> Forgot Password</Link>
                        </p>
                    </form>
                </Authorizer>
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
            dispatch(setUser(uid))
        }
    }
};

export default connect(null, mapDispatchToProps)(Login);
