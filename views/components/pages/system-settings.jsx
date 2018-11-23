import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import SystemSettingsForm from "../elements/forms/system-settings-form.jsx";

class SystemSettings extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

    }

    render () {
        return(
            <Authorizer permissions="can_administrate">
                <div className="app-content __manage-system-settings">
                    <Content>
                        <div className={`_title-container`}>
                            <h1 className={`_heading`}>Manage System Settings</h1>
                        </div>
                        <SystemSettingsForm/>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default SystemSettings;
