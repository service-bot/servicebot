import React from 'react';
import ReactDOM from 'react-dom';
import {Link, browserHistory} from 'react-router';
import {Price, getPrice} from '../../utilities/price.jsx';
import { connect } from 'react-redux';
let _ = require("lodash");
import getSymbolFromCurrency from 'currency-symbol-map'


class ServiceListItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            image: null,
            icon: null,
            imageColor: false,
            display_setting: {
                icon: false,
                background: false,
                backgroundColor: '#000000',
                category: false,
                date: false,
                cost: true,
                item_count: 6
            }
        };
        this.getCoverImage = this.getCoverImage.bind(this);
        this.getIcon = this.getIcon.bind(this);
    }

    componentDidMount() {
        this.getCoverImage();
        this.getIcon();
    }

    getCoverImage(){
        let self = this;
        fetch(`/api/v1/service-templates/${this.props.service.id}/image`).then(function(response) {
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
        fetch(`/api/v1/service-templates/${this.props.service.id}/icon`).then(function(response) {
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

    createMarkup(html) {
        return {__html: html};
    }

    render(){
        let style = {};
        let options = this.props.options;
        if(this.state.image){
            style.header = {
                "backgroundImage" : `url('${this.state.image}')`,
                "backgroundSize" : 'cover', "backgroundPosition" : 'center center',
                "color": "#fff",
                "height": "150px"
            };
            if(options){
                style.header.backgroundColor = _.get(options, 'service_box_header_background_color.value', '#000000');
                style.header.color = _.get(options, 'service_box_header_text_color.value', '#ffffff');
            }
        }else{
            if(options){
                style.header = {
                    "backgroundColor" : _.get(options, 'service_box_header_background_color.value', '#000000'),
                    "color": _.get(options, 'service_box_header_text_color.value', '#ffffff'),
                    "height": "150px"
                };
            }else{
                style = {"backgroundColor" : "#000", "color": "#fff", "height": "150px"};
            }
        }

        if(options){
            style.body = {
                "backgroundColor" : _.get(options, 'service_box_body_background_color.value', '#000000'),
                "color": _.get(options, 'service_box_body_text_color.value', '#ffffff')
            }
        }

        //gathering data
        let myService = this.props.service;
        let serviceId = myService.id;
        let serviceName = myService.name;
        let serviceDescription = myService.description;
        let category = _.get(myService, 'references.service_categories[0].name', '');

        let getPriceOrTrial = ()=>{
            if(_.get(this.props.options, 'show_trial.value') == 'false' || myService.trial_period_days <= 0) {
                return getPrice(myService);
            }
            else{
                return <span>{myService.trial_period_days} {"Day Free Trial"}</span>;
            }
        };


        let getRequestText = ()=>{
            let serType = myService.type;
            if(_.get(this.props.options, 'show_trial.value') == 'false' || myService.trial_period_days <= 0) {
                if (_.get(this.props.options, 'service_box_request_button_text.value') === "default") {
                    if (serType === "subscription") {
                        return ("Subscribe");
                    } else if (serType === "one_time") {
                        return ("Buy");
                    } else if (serType === "custom") {
                        return ("Request");
                    } else {
                        return ("")
                    }
                } else {
                    return (_.get(this.props.options, 'service_box_request_button_text.value'));
                }
            }
            else{
                return ("Afterwards")
            }
        };

        return (
            <div id={`service-card-${serviceId}`} className="service-column col-xs-12 col-sm-6 col-lg-4 col-xl-4">
                <div className="card-wrapper service" onClick={()=>{browserHistory.push(this.props.url)}} style={{height: this.props.height}}>
                    <div id={`service-${serviceId}`} className={`card service`} style={style.body}>
                        <div className={`card-image-holder ${this.state.image ? 'image' : 'no-image'}`} style={style.header}>
                            {this.state.icon && _.get(this.props.options, 'service_box_icon_display.value') == "true" &&
                                <img src={this.state.icon} alt="icon"/>
                            }

                            {this.state.display_setting.category &&
                                <h3 className="card-service-company">{category}</h3>
                            }
                        </div>
                        <div className="card-block-wrapper">
                            <div className={`card-block ${this.state.display_setting.icon && 'with-icon'}`} style={style.body}>
                                <div className="card-title-holder">
                                    <h3 className="card-title">{serviceName}</h3>
                                    {this.state.display_setting.date &&
                                    <small className="meta">Published
                                        on: {new Date(this.props.created).toDateString()}</small>
                                    }
                                </div>
                                <div className="card-body" ref="myCardBody" style={style.body}>
                                    <p>{serviceDescription}</p>
                                </div>
                            </div>
                            <div className="card-footer" style={style.body}>
                                <span className="price">{getPriceOrTrial()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="request-button" style={{"backgroundColor": style.header.backgroundColor, "color": style.header.color}}>
                        <Link to={this.props.url} className="btn btn-box">
                            <div className="btn btn-black" style={{"backgroundColor": style.header.backgroundColor, "color": style.header.color}}>
                                <span>{getRequestText() + " "}</span>
                                <span>{getPrice(myService) ? getPrice(myService) : ""}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(ServiceListItem);



