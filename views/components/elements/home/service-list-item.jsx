import React from 'react';
import ReactDOM from 'react-dom';
import {Link, browserHistory} from 'react-router';
import Price from '../../utilities/price.jsx';
import { connect } from 'react-redux';
let _ = require("lodash");

class ServiceListItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            image: null,
            icon: null,
            imageColor: false,
            company_name: 'ServiceBot',
            display_setting: {
                icon: false,
                background: false,
                backgroundColor: '#000000',
                category: false,
                date: false,
                cost: true,
                request_text: null,
                item_count: 6
            },
            systemOptions: this.props.options || {},
            height: 0
        };
        this.getCoverImage = this.getCoverImage.bind(this);
        this.getIcon = this.getIcon.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.options){
            this.setState({systemOptions: nextProps.options});
        }
    }

    componentDidMount() {

        const height = document.getElementById(`service-card-${this.props.service.id}`).clientHeight;
        // console.log(`service-card-${this.props.service.id}`, height);
        this.props.handleSyncHeight(height);
        this.setState({height: height});

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
            // console.log("There was problem fetching your image:" + error.message);
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
            // console.log("There was problem fetching your image:" + error.message);
        });
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.height > 0 && nextProps.height != this.state.height){
            this.setState({height: nextProps.height});
        }
    }

    getMyCardSize(){
        return ReactDOM.findDOMNode(this.refs.myCard).getBoundingClientRect();
    }


    createMarkup(html) {
        return {__html: html};
    }

    detailsOverflowed() {
        let myCardBody = ReactDOM.findDOMNode(this.refs.myCardBody).getBoundingClientRect();
        let myCardDetails = ReactDOM.findDOMNode(this.refs.myCardDetails).getBoundingClientRect();

        return myCardBody.height < myCardDetails;
    }

    render(){
        let style = {};
        let options = this.state.systemOptions;
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


        let getPrice = ()=>{
            let serType = myService.type;
            if (serType == "subscription"){
                return (
                    <span>
                        <Price value={myService.amount}/>
                        {myService.interval_count == 1 ? ' /' : ' / ' + myService.interval_count} {' '+myService.interval}
                    </span>
                );
            }else if (serType == "one_time"){
                return (<span><Price value={myService.amount}/></span>);
            }else if (serType == "custom"){
                return false;
            }else{
                return (<span><Price value={myService.amount}/></span>)
            }
        };

        let getRequestText = ()=>{
            let serType = myService.type;
            if (serType == "subscription"){
                return ("Subscribe");
            }else if (serType == "one_time"){
                return ("Buy");
            }else if (serType == "custom"){
                return ("Request");
            }else{
                return ("")
            }
        };

        return (
            <div id={`service-card-${serviceId}`} className="service-column col-xs-12 col-sm-6 col-lg-4 col-xl-4" ref="myCardColumn">
                <div className="card-wrapper service" onClick={()=>{browserHistory.push(this.props.url)}}>
                    <div id={`service-${serviceId}`} className={`card service`} style={style.body} ref="myCard">
                        <div className={`card-image-holder ${this.state.image ? 'image' : 'no-image'}`} style={style.header}>
                            {this.state.icon &&
                                <img src={this.state.icon} alt="icon"/>
                            }

                            {this.state.display_setting.category &&
                                <h3 className="card-service-company">{category}</h3>
                            }
                        </div>
                        <div className={`card-block ${this.state.display_setting.icon && 'with-icon'}`} style={style.body}>
                            <div className="card-title-holder">
                                <h3 className="card-title">{serviceName}</h3>
                                {this.state.display_setting.date &&
                                <small className="meta">Published
                                    on: {new Date(this.props.created).toDateString()}</small>
                                }
                            </div>
                        </div>
                        <div className="card-body" ref="myCardBody" style={style.body}>
                            <p>{serviceDescription}</p>
                        </div>
                        <div className="card-footer" style={style.body}>
                            <span className="price">{getPrice()}</span>
                        </div>
                    </div>
                    <div className="request-button" style={{"backgroundColor": style.header.backgroundColor, "color": style.header.color}}>
                        <Link to={this.props.url} className="btn btn-box">
                            <div className="btn btn-black" style={{"backgroundColor": style.header.backgroundColor, "color": style.header.color}}>
                                <span>{this.state.display_setting.request_text || getRequestText()} </span>
                                <span>{getPrice() ? getPrice() : ""}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(ServiceListItem);



