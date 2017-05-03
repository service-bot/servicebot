import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import Price from '../../utilities/price.jsx';
let _ = require("lodash");

class ServiceListItem extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            boxColor: false,
            boxColor2: false,
            image: false,
            imageColor: false,
            theme: 'light',
            company_name: 'ServiceBot',
            display_setting: {
                icon: false,
                date: false,
                cost: true
            },
            serviceOpened: {},
            opened: false,
            height: 0
        };
        this.getRandomColor = this.getRandomColor.bind(this);
        this.openService = this.openService.bind(this);
        this.closeService = this.closeService.bind(this);
        this.getCoverImage = this.getCoverImage.bind(this);
    }

    componentDidMount(){

        const height = document.getElementById(`service-card-${this.props.service.id}`).clientHeight;
        // console.log(`service-card-${this.props.service.id}`, height);
        this.props.handleSyncHeight(height);
        this.setState({ height: height });

        this.getCoverImage();
    }

    getCoverImage(){
        let self = this;
        fetch(`/api/v1/service-templates/${this.props.service.id}/image`).then(function(response) {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        }).then(function(myBlob) {
            let objectURL = URL.createObjectURL(myBlob);
            self.setState({image: objectURL});
        }).catch(function(error) {
            // console.log("There was problem fetching your image:" + error.message);
        });
    }

    componentWillReceiveProps(nextProps){
        // console.log('log new prop height', nextProps.height);
        if(nextProps.height > 0 && nextProps.height != this.state.height){
            // console.log('its a new height');
            this.setState({height: nextProps.height});
        }

    }

    getRandomColor(){
        // let colors = ['#2ecc71', '#2980b9', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#7f8c8d'];
        let colors = ['#34495e'];
        return colors[this.getRandomInt(0, colors.length-1)];
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    getMyCardSize(){
        return ReactDOM.findDOMNode(this.refs.myCard).getBoundingClientRect();
    }

    openService(e){
        e.preventDefault();
        let myCard = this.getMyCardSize();
        let windowWidth = window.innerWidth;
        let myCardWidth = this.getMyCardSize().width*1.40;
        // console.log(window);
        // console.log('myCard', myCard);
        // console.log('window size', windowWidth);

        let cardOpenedStyle = {
            "position": "fixed",
            "height": "80vh",
            "width": `${myCardWidth}px`,
            "top": "50%",
            "left": `${(windowWidth-(myCardWidth))/2}px`,
            "zIndex": "100",
            "transform": "translateY(-50%)"
        };
        document.body.classList.add(`no-scroll`);
        this.setState({serviceOpened: cardOpenedStyle, opened: true});
    }
    closeService(e){
        e.preventDefault();
        document.body.classList.remove(`no-scroll`);
        this.setState({serviceOpened: {}, opened: false});
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
        let theme = this.state.theme;

        let style={};
        let cardStyle = {height: this.state.height || 'auto'};
        // console.log(`service-card-${this.props.service.id} style`, cardStyle);
        if(this.state.image){
            // console.log("i have an image", this.state.image);
            style = {
                "backgroundImage" : `url('${this.state.image}')`,
                "backgroundSize" : 'cover', "backgroundPosition" : 'center center',
                "color": "#fff",
                "height": "150px"
            };
        }else{
            style = {"backgroundColor" : this.getRandomColor(), "color": "#fff", "height": "150px"};
        }

        //gathering data
        let myService = this.props.service;
        let serviceId = myService.id;
        let serviceName = myService.name;
        let serviceDescription = myService.description;
        let serviceDetails = _.get(myService, "details", '');
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
                return (<span/>);
            }else{
                return (<span><Price value={myService.amount}/></span>)
            }
        };


        return (
            <div id={`service-card-${serviceId}`} className="service-column col-xs-12 col-sm-6 col-lg-4 col-xl-4" ref="myCardColumn">
                <div className="card-wrapper service">
                    <div id={`service-${serviceId}`} className={`card service ${theme} ${this.state.opened && 'opened'}`}
                         style={this.state.opened ? this.state.serviceOpened : cardStyle} ref="myCard">
                        <div className={`card-image-holder ${this.state.image ? 'image' : 'no-image'}`} style={style}>
                            {/*{this.state.image ? <img src={this.state.image}/> : <h3>Category</h3>}*/}
                            <h3 className="card-service-company">{category}</h3>
                        </div>
                        <div className={`card-block ${this.state.display_setting.icon && 'with-icon'}`}>
                            {/*<img className="service-icon" src="assets/service_icons/wordpress.png"/>*/}
                            <div className="card-title-holder">
                                <h3 className="card-title">{serviceName}</h3>
                                {this.state.display_setting.date &&
                                <small className="meta">Published
                                    on: {new Date(this.props.created).toDateString()}</small>
                                }
                            </div>
                        </div>
                        <div className="card-body" ref="myCardBody">
                            <p>{serviceDescription}</p>
                            {this.state.opened &&
                            <div className="service-details" dangerouslySetInnerHTML={this.createMarkup(serviceDetails)} ref="myCardDetails"/>
                            }
                        </div>
                        <div className="card-footer">
                            <span className="seller">
                                <span className="price">{getPrice()}</span>
                                {/*<Price value={servicePrice}/></span>{serviceInterval ? `/${serviceInterval}` : ''}</span>*/}
                            </span>
                            <div>
                                {this.state.opened ?
                                    <Link to="#" onClick={this.closeService} className="btn btn-rounded btn-default m-r-5">Close</Link> :
                                    <Link to="#" onClick={this.openService} className="btn btn-rounded btn-default m-r-5">View</Link>
                                }
                                <Link to={this.props.url} className="btn btn-rounded btn-black">Request</Link>
                            </div>
                        </div>
                    </div>
                    { this.state.opened && <div onClick={this.closeService} className="card-backdrop"/> }
                </div>
            </div>
        );
    }
}

export default ServiceListItem;



