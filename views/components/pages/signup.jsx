import React from 'react';
import {browserHistory} from 'react-router';
import Fetcher from "../utilities/fetcher.jsx";
import update from "immutability-helper";
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import UserFormRegister from "../elements/forms/user-form-register.jsx";

class SignUp extends React.Component {

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
        var that = this;

        Fetcher("/api/v1/auth/session", "POST", that.state.form)
            .then(function(result){
                if(!result.error) {

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
                [name] : {$set:value}
            }
        });
        console.log(formState);
        this.setState(formState);
    }

    componentWillUnmount(){
        document.body.classList.remove('login')
    }
    componentDidMount(){
        console.log("HISTORY", browserHistory);
        if(!isAuthorized({anonymous:true})){
            return browserHistory.push("/");
        }
        document.body.classList.add('login')
    }
    render () {
        return(
            <Authorizer anonymous={true}>
                <UserFormRegister location={this.props.location} token={this.props.params.token || false}/>
            </Authorizer>
        );
    }
}

export default SignUp;
