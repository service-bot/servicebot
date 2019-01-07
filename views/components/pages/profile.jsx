import React from 'react';
import cookie from 'react-cookie';
import {browserHistory} from 'react-router';
import {isAuthorized} from "../utilities/authorizer.jsx";
import Content from "../layouts/content.jsx";
import UserFormEdit from "../elements/forms/user-form-edit.jsx";
import {Fetcher} from "servicebot-base-form";
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};

class Profile extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        this.state = {myUser:false, url:`/api/v1/users/${uid}`}

        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({uid : this.props.uid})){
            return browserHistory.push("/login");
        } else {
            this.fetchUser();
        }
    }

    fetchUser(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                self.setState({loading: false, myUser: response});
            }else{
                console.error("error getting user", response);
                self.setState({loading: false});
            }
        })
    }

    getUserEditForm(){
        let {user} = this.props;
        let {myUser} = this.state;

        if(user && user.status !== "invited") {
            return <UserFormEdit myUser={myUser}/>
        }
        return <div className="invited-user-profile basic-info col-md-6 col-md-offset-3">
                <span>Please complete your registration by following the link that was emailed to you prior to editing your profile.</span>
            </div>
    }

    render () {
        let {loading} = this.state;

        return(
            <div className="app-content __my-profile">
                <Content>
                    <div className={`_title-container`}>
                        <h1 className={`_heading`}>My Profile</h1>
                    </div>
                    {loading ? <Load/> : this.getUserEditForm()}
                </Content>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Profile);
