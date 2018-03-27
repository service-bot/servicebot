import React from 'react';
import Alert from 'react-s-alert';
import {Link, browserHistory} from 'react-router';
import Fetcher from "../../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {connect} from "react-redux";
import {setPermissions} from "../../utilities/actions";

class ResetPassword extends React.Component {

    constructor(props) {
        super(props);
        let uid = this.props.params.uid || null;
        let token = this.props.params.token || null;
        this.state = {
            resetPassURL: `/api/v1/auth/reset-password/${uid}/${token}`,
            form : {}
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleReset = this.handleReset.bind(this);

    }



    handleReset(e){
        e.preventDefault();
        let self = this;
        Fetcher(this.state.resetPassURL, "POST", this.state.form).then(function(result){
            if(!result.error) {
                browserHistory.push("/login");
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
        this.setState(formState);
    }

    componentWillUnmount(){
        document.body.classList.remove('login')

    }

    componentDidMount(){
        if(!isAuthorized({anonymous:true})){
            return browserHistory.push("/");
        }

        Fetcher(this.state.resetPassURL).then(function (response) {
            if(response.isValid){
            }else{
                return browserHistory.push("/");
            }
        });

        document.body.classList.add('login')

    }
    render () {
        return(
            <Authorizer anonymous={true}>
                <form className="sign-in">
                    {/*<img className="login-brand" src="/assets/logos/brand-logo-dark.png"/>*/}
                    <h3>Reset Password</h3>
                    <p>
                        Enter your new password to reset.
                    </p>
                    <div className="form-group">
                        <label htmlFor="sign-in-2-email" className="bmd-label-floating">New Password</label>
                        <input onChange={this.handleInputChange} id="password" type="password" name="password" className="form-control"/>
                        <span className="bmd-help">Please enter your new password</span>
                    </div>
                    <button onClick={this.handleReset} type='submit' className="btn btn-raised btn-lg btn-primary btn-block">Reset Password</button>
                </form>
            </Authorizer>
        );
    }
}

export default connect(null, (dispatch => ({setPermissions : (permissions) => dispatch(setPermissions(permissions))})))(ResetPassword);
