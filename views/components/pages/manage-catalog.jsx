import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";

class ManageCatalog extends React.Component {

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
        let subtitle = 'Create and manage offerings';
        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} subtitle={subtitle}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            {this.props.children}
                        </div>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ManageCatalog;
