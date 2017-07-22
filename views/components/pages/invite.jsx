import React from 'react';
import {browserHistory} from 'react-router';
import Fetcher from "../utilities/fetcher.jsx";
import UserFormInvite from "../elements/forms/user-form-invite.jsx";

class SignUp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        console.log("opopo")
    }

    componentWillMount(){
        console.log('IM HERE first');
        console.log(`/api/v1/invitation/${this.props.params.token}`)
        Fetcher(`/api/v1/invitation/${this.props.params.token}`)
            .catch(function (err) {
                console.log('YO%5')
                return browserHistory.push("/404");
        })
    }

    render () {
        return(
            <UserFormInvite location={this.props.location} token={this.props.params.token || false}/>
        );
    }
}

export default SignUp;
