import React from 'react';
import cookie from 'react-cookie';
import Link from 'react-router';
import Authorizer from '../utilities/authorizer.jsx'

class Avatar extends React.Component {

    constructor(props){
        super(props);
        let uid = null;
        if(!this.props.uid){
            uid = cookie.load("uid");
        }else{
            uid = this.props.uid;
        }

        this.state = {
            size: this.props.size,
            avatarURL: `/api/v1/users/${uid}/avatar`
        };
    }

    render(){

        return (
            <div className={`badge badge-${this.state.size}`}>
                <img id="edit-avatar-img" src={this.state.avatarURL} ref="avatar" className="img-circle" alt="badge"/>
            </div>
        );

    }

}

export default Avatar