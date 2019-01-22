import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import {Fetcher} from "servicebot-base-form";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import UserFormEdit from "../elements/forms/user-form-edit.jsx";
import Load from '../utilities/load.jsx';

class UserEdit extends React.Component {

    constructor(props){
        super(props);
        this.state = {myUser:false, url:`/api/v1/users/${this.props.params.userId}`};

        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({permissions: ["can_administrate", "can_manage"]})){
            return browserHistory.push("/login");
        }else{
            this.fetchUser();
        }
    }

    fetchUser(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                self.setState({loading: false, myUser: response});
            }else{
                self.setState({loading: false});
            }
        }).catch(function(err){
            browserHistory.push("/");
        })
    }

    render () {
        let {myUser, myUser: {email, name}, loading} = this.state;

        return <Authorizer permissions="can_administrate">
                    <div className="app-content __my-profile">
                        <Content>
                            <div className={`_title-container`}>
                                <h1 className={`_heading`}>Editing {name || email}</h1>
                            </div>
                            {loading ? <Load/> : <UserFormEdit myUser={myUser}/>}
                        </Content>
                    </div>
                </Authorizer>
    }
}

export default UserEdit;
