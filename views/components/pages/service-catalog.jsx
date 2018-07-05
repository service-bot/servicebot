import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ServiceCatalogList from "../elements/service-catalog-list.jsx";

class ServiceCatalog extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({permissions: "can_administrate"})){
            return browserHistory.push("/login");
        }
    }

    render () {
        let self = this;
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:'Service Catalog', link:null}];
        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <ServiceCatalogList/>
                        </div>

                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ServiceCatalog;
