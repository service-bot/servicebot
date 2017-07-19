import React from 'react';
import cookie from 'react-cookie';
import Link from 'react-router';
import Authorizer from '../utilities/authorizer.jsx'
import {connect } from "react-redux";


const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid
    }
}

class Avatar extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            size: this.props.size,
            avatarURL: `/api/v1/users/${props.uid}/avatar`
        };
    }

    render(){

        return (
            <div className={`badge badge-${this.state.size} badge-avatar`}>
                <img id="edit-avatar-img" src={`/api/v1/users/${this.props.uid}/avatar`} ref="avatar" className="img-circle" alt="badge"/>
            </div>
        );

    }

}

export default connect(mapStateToProps)(Avatar)