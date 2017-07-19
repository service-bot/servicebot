import React from 'react';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Content from "../layouts/content.jsx";
import ServiceRequestForm from "../elements/forms/service-instance-form-request-v2.jsx"
import PageSection from "../layouts/page-section.jsx";
import Featured from "../layouts/featured.jsx";
import Fetcher from "../utilities/fetcher.jsx"
import {Price} from "../utilities/price.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");


class ServiceRequest extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            loading: true,
            id: this.props.params.templateId,
            image: null,
            icon: null,
            service: null,
            systemOptions: this.props.options || {},
        };

        this.getService = this.getService.bind(this);
        this.getCoverImage = this.getCoverImage.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.createMarkup = this.createMarkup.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.options){
            this.setState({systemOptions: nextProps.options});
        }
    }

    componentDidMount(){

        this.getService();
        this.getCoverImage();
        this.getIcon();
    }

    getService(){
        let self = this;
        Fetcher(`/api/v1/service-templates/${this.state.id}/request`).then(function(response){
            if(!response.error){
                self.setState({service : response});
            }else{
                console.log("Error getting template request data", response);
            }
            self.setState({loading:false});
        });
    }

    getCoverImage(){
        let self = this;
        let imageURL = `/api/v1/service-templates/${this.state.id}/image`;
        fetch(imageURL).then(function(response) {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.', response);
        }).then(function(myBlob) {
            let objectURL = URL.createObjectURL(myBlob);
            self.setState({image: objectURL});
        }).catch(function(error) {
            // console.log("There was problem fetching your image:" + imageURL + " " + error);
        });
    }

    getIcon(){
        let self = this;
        fetch(`/api/v1/service-templates/${this.state.id}/icon`).then(function(response) {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        }).then(function(myBlob) {
            let objectURL = URL.createObjectURL(myBlob);
            self.setState({icon: objectURL});
        }).catch(function(error) {
            // console.log("There was problem fetching your image:" + error.message);
        });
    }

    createMarkup(html) {
        return {__html: html};
    }

    render () {
        if(this.state.loading){
            return(<span>loading</span>);
        }else {
            let getPrice = () => {
                let myService = this.state.service;
                let serType = myService.type;
                if (serType == "subscription") {
                    return (
                        <span>
                        <Price value={myService.amount}/>
                            {myService.interval_count == 1 ? ' /' : ' / ' + myService.interval_count} {' ' + myService.interval}
                    </span>
                    );
                } else if (serType == "one_time") {
                    return (<span><Price value={myService.amount}/></span>);
                } else if (serType == "custom") {
                    return false;
                } else {
                    return (<span><Price value={myService.amount}/></span>)
                }
            };

            return (

                <div className="page-service-request">
                    <Featured imageURL={this.state.image}>
                        {this.state.icon ?
                            <img className="featured-icon" src={this.state.icon} alt="icon"/> :
                            <div className="featured-icon"/>
                        }
                        <h1 className="featured-title">{this.state.service && this.state.service.name}</h1>
                        <p className="featured-body">{this.state.service && this.state.service.description}</p>
                        <h1 className="featured-price">{getPrice()}</h1>
                    </Featured>
                    <Content>
                        <PageSection>
                            <ServiceRequestForm templateId={this.state.id}/>
                        </PageSection>
                    </Content>
                </div>
            );
        }
    }
}

export default connect((state) => {return {options:state.options}})(ServiceRequest);