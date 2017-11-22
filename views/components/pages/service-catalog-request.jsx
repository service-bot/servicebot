import React from 'react';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Content from "../layouts/content.jsx";
import ServiceRequestForm from "../elements/forms/service-instance-form-request.jsx"
import PageSection from "../layouts/page-section.jsx";
import Featured from "../layouts/featured.jsx";
import {AdminEditingGear, AdminEditingSidebar} from "../layouts/admin-sidebar.jsx";
import Fetcher from "../utilities/fetcher.jsx"
import {Price, getPrice} from "../utilities/price.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");
import IconHeading from "../layouts/icon-heading.jsx";
import InfoToolTip from "../elements/tooltips/info-tooltip.jsx";


class ServiceRequest extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            loading: true,
            id: this.props.params.templateId,
            service: null,
        };

        this.getService = this.getService.bind(this);
    }

    componentDidMount(){
        this.getService();
    }

    getService(){
        let self = this;
        Fetcher(`/api/v1/service-templates/${this.state.id}/request`).then(function(response){
            if(!response.error){
                self.setState({service : response});
            }else{
                console.error("Error getting template request data", response);
            }
            self.setState({loading:false});
        });
    }

    render () {
        if(this.state.loading){
            return(<span>loading</span>);
        }else {
            let { options } = this.props;
            let service_request_title_description = _.get(options, 'service_request_title_description.value', 'What you are getting');
            let service_request_title_form = _.get(options, 'service_request_title_form.value', 'Get Your Service');

            return (
                <div className="page-service-request">
                    <RequestPageFeatured templateId={this.state.id} templateData={this.state.service}/>
                    <Content>
                        <PageSection>
                            <div className="basic-info col-md-6">
                                <div className="service-request-details">
                                    <IconHeading imgIcon="/assets/custom_icons/what_you_are_getting_icon.png"
                                                 title={service_request_title_description}/>
                                    <div dangerouslySetInnerHTML={{__html: this.state.service.details}}/>
                                </div>
                            </div>
                            <div className="basic-info col-md-6">
                                <div className="service-request-form">
                                    <IconHeading imgIcon="/assets/custom_icons/what_you_are_getting_icon.png"
                                                 title={service_request_title_form}/>
                                    <ServiceRequestForm templateId={this.state.id} service={this.state.service}/>
                                </div>
                            </div>
                        </PageSection>
                    </Content>
                </div>
            );
        }
    }
}


class RequestPageFeatured extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.templateId,
            image: null,
            icon: null,
            editingMode: false,
            editingGear: false
        };
        this.getCoverImage = this.getCoverImage.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.toggleOnEditingGear = this.toggleOnEditingGear.bind(this);
        this.toggleOffEditingGear = this.toggleOffEditingGear.bind(this);
    }

    componentDidMount(){
        this.getCoverImage();
        this.getIcon();
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

        });
    }

    toggleEditingMode(){
        if(this.state.editingMode){
            this.setState({editingMode: false})
        }else{
            this.setState({editingMode: true})
        }
    }
    toggleOnEditingGear(){
        this.setState({editingGear: true})
    }
    toggleOffEditingGear(){
        this.setState({editingGear: false})
    }

    render(){
        let { templateData, templateData: {id, name, amount, trial_period_days, description}, options } = this.props;

        const featuredStyle = {
            height: _.get(options, 'purchase_page_featured_area_height.value', 'auto'),
            minHeight: _.get(options, 'purchase_page_featured_area_height.value', 'auto'),
            paddingTop: _.get(options, 'purchase_page_featured_area_padding_top.value', '90px'),
            paddingBottom: _.get(options, 'purchase_page_featured_area_padding_bottom.value', '0px'),
        };

        const featuredOverlayStyle = {
            backgroundColor: _.get(options, 'purchase_page_featured_area_overlay_color.value', '#000000'),
            opacity: _.get(options, 'purchase_page_featured_area_overlay_opacity.value', '0'),
        };

        const featuredTextStyle = {
            color: _.get(options, 'purchase_page_featured_area_text_color.value', '#ffffff'),
        };

        return(
            <Featured imageURL={this.state.image} style={featuredStyle} overlay={{show: true, style: featuredOverlayStyle,}}>
                <PageSection className="request-featured-section"
                             onMouseEnter={this.toggleOnEditingGear}
                             onMouseLeave={this.toggleOffEditingGear}>
                    {this.state.icon ?
                        <img className="featured-icon" src={this.state.icon} alt="icon"/> :
                        <div className="featured-icon"/>
                    }
                    <div className="request-featured-section" style={featuredTextStyle}>
                        <h1 className="featured-title" style={featuredTextStyle}>{name}</h1>
                        <p className="featured-body" style={featuredTextStyle}>{description}</p>
                        {(trial_period_days>0) ? (
                            <h1 className="featured-price" style={featuredTextStyle}>{trial_period_days} Day Free Trial
                                <span className="free-trial" style={featuredTextStyle}>{getPrice(templateData)}</span>
                            </h1>
                        ) : (
                            <h1 className="featured-price" style={featuredTextStyle}>{getPrice(templateData)}</h1>
                        )}
                    </div>
                    {this.state.editingGear &&
                    <AdminEditingGear toggle={this.toggleEditingMode} name="Heading Settings"/>
                    }
                    {this.state.editingMode &&
                    <AdminEditingSidebar toggle={this.toggleEditingMode}
                                         filter = {["purchase_page_featured_area_overlay_color",
                                             "purchase_page_featured_area_overlay_opacity",
                                             "purchase_page_featured_area_text_color",
                                             "purchase_page_featured_area_height",
                                             "purchase_page_featured_area_padding_top",
                                             "purchase_page_featured_area_padding_bottom",
                                             "service_request_title_description",
                                             "service_request_title_form"
                                         ]}/>
                    }
                </PageSection>
            </Featured>
        );
    }
}

RequestPageFeatured = connect((state) => {return {options:state.options}})(RequestPageFeatured);
ServiceRequest = connect((state) => {return {options:state.options}})(ServiceRequest);
export default ServiceRequest;