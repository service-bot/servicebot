import React from 'react';
import Alert from 'react-s-alert';
import {Link, browserHistory} from 'react-router';
import {Fetcher} from "servicebot-base-form";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {connect} from "react-redux";
import {setPermissions} from "../../utilities/actions";
import Content from "../../layouts/content.jsx";
import {Section} from "../../layouts/section.jsx";

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
                <div className="app-content __password-reset">
                    <Content>
                        <div className={`_title-container`}>
                            <h1 className={`_heading`}>Password Reset</h1>
                        </div>
                        <Section>
                            <form className="sign-in">
                            <div className="sb-form-group">
                                <label className="_label-">New Password</label>
                                <input onChange={this.handleInputChange} id="password" type="password" name="password" className="_input-"/>
                            </div>
                                <div className="sb-form-group">
                            <button onClick={this.handleReset} type='submit' className="buttons _default">Reset Password</button>
                                </div>
                        </form>
                        </Section>
                    </Content>
                </div>
            </Authorizer>
        )
    }
}

export default connect(null, (dispatch => ({setPermissions : (permissions) => dispatch(setPermissions(permissions))})))(ResetPassword);
