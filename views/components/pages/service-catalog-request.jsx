import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ServiceCatalogList from "../elements/service-catalog-list.jsx";
import ServiceRequestForm from "../elements/forms/service-instance-form-request.jsx"
import Fetcher from "../utilities/fetcher.jsx"
import ModalPaymentSetup from "../elements/modals/modal-payment-setup.jsx"
import cookie from 'react-cookie';


class ServiceRequest extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({})){
            return browserHistory.push("/signup");
        }
    }


    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},
                            {name:'My Services', link:'/my-services'},
                            {name:'Service Catalog', link:'/service-catalog'},
                            {name:'Service Request', link: null}];
        return(
            <Authorizer>
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row m-b-20">
                            <ServiceRequestForm templateId={this.props.params.templateId}/>
                        </div>

                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ServiceRequest;
