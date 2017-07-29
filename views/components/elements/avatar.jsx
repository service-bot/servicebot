import React from 'react';
import cookie from 'react-cookie';
import Link from 'react-router';
import Authorizer from '../utilities/authorizer.jsx'
import {connect } from "react-redux";

class Avatar extends React.Component {

    constructor(props){
        super(props);
    }

    render(){

        return (
            <div className={`badge badge-${this.props.size} badge-avatar`}>
                <img id="edit-avatar-img" src={`/api/v1/users/${this.props.uid}/avatar`} ref="avatar" className="img-circle" alt="badge"/>
            </div>
        );

    }

}

export default Avatar;