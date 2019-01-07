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
        let {size} = this.props
        return (
            <div className={`avatar __${size}`}>
                <img id="edit-avatar-img" src={`/api/v1/users/${this.props.uid}/avatar`} ref="avatar" alt="avatar"/>
            </div>
        );

    }

}

export default Avatar;