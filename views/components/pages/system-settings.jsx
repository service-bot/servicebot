import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
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
        let pageName = this.props.route.name;
        let subtitle = 'Change system settings, theme, and content'
        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} subtitle={subtitle}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <SystemSettingsForm/>
                        </div>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default SystemSettings;
