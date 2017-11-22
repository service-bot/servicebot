import React from 'react';
import Fetcher from '../../utilities/fetcher.jsx';
import DashboardWidget from "./dashboard-widget.jsx";

class ServiceApplicationLauncher extends React.Component {

    constructor(props){
        super(props);
        let serviceInstanceId = this.props.serviceInstance.id;
        this.state = {
            chargeItems: [],
            url: `/api/v1/service-instances/${serviceInstanceId}`,
            loading:true,
            application: 'in_progress'
        };
        this.waitForApplication = this.waitForApplication.bind(this);
        this.urlLink = this.urlLink.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.waitForApplication();
    }

    waitForApplication() {
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if (!response.error) {
                if (response.status === "in_progress") {
                    console.log("Waiting for the app...");
                    setTimeout(self.waitForApplication, 3000);
                } else {
                    console.log("App is now running.")
                    self.setState({application : 'running'});
                }
            }
        });
    }

    urlLink(url){
        return function(event) {
            event.preventDefault();
            console.log(url);
            window.open(url, '_blank');
        }
    }

    render () {
        let self = this;
        if(this.state.application === 'in_progress') {
            if(self.props.large) {
                return (<DashboardWidget reversed={true} small={true} margins="m-t-0" widgetColor="#4404bb" widgetIcon="refresh fa-spin fa-fw" widgetData="Creating App" widgetClass="col-xs-12 col-sm-8 col-md-6 col-lg-6 col-xl-6 p-l-0" />);
            } else {
                return (<div className="btn btn-default btn-rounded btn-sm m-r-5 application-launcher">Creating App <i className="fa fa-refresh fa-spin fa-fw"/></div>);
            }

        } else {
            let websiteLink = this.props.instanceLink;
            //Make sure the URL is set.
            if(websiteLink.data) {
                if(self.props.large) {
                    return (<DashboardWidget reversed={true} small={true} margins="m-t-0" link={websiteLink.data.value} widgetColor="#4404bb" widgetIcon="external-link-square" widgetData="Open Application" widgetClass="col-xs-12 col-sm-8 col-md-6 col-lg-6 col-xl-6 p-l-0" widgetHoverClass="open-application" />);
                } else {
                    return (<button className="btn btn-default btn-rounded btn-sm m-r-5" onClick={self.urlLink(websiteLink.data.value)} > Open Application <i className="fa fa-external-link-square" /></button>);
                }
            } else {
                return (null);
            }


        }
    }
}

export default ServiceApplicationLauncher;
