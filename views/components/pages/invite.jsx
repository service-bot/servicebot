import React from 'react';
import {browserHistory} from 'react-router';
import Fetcher from "../utilities/fetcher.jsx";
import UserFormInvite from "../elements/forms/user-form-invite.jsx";
import Content from '../layouts/content.jsx';

class SignUp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount(){
        Fetcher(`/api/v1/invitation/${this.props.params.token}`)
            .catch(function (err) {
                return browserHistory.push("/404");
        })
    }

    render () {
        return(
            <Content primary={true}>
                <div className="centered-box col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                    <UserFormInvite location={this.props.location} token={this.props.params.token || false}/>
                </div>
            </Content>
        );
    }
}

export default SignUp;
