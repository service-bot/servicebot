import React from 'react';
import Fetcher from '../utilities/fetcher.jsx'
import {Link} from 'react-router';
import _ from "lodash";
import Load from '../utilities/load.jsx';
import {Price, getPrice} from '../utilities/price.jsx';
import DateFormat from '../utilities/date-format.jsx';

// Accepts the following URL query
// Example: /service/1/embed?bodyColor=444444&footerColor=000000&noDate
// Options: bodyColor, footerColor, icon = [boolean], noDate, noCost, fullDescription, textColor, requestButton
class Embed extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            service: [],
            image: false,
            url: `/api/v1/service-templates/${this.props.params.serviceId}/request`,
            loading:true,
            requestUrl: ''};

        document.body.classList.add('EmbedFrame');
        let attributeRemove = ['data-layout', 'data-sidebar', 'data-navbar', 'data-controller', 'data-view'];
        for(let i = 0; i < attributeRemove.length; i++){
            document.body.removeAttribute(attributeRemove[i]);
        }

        this.getCoverImage = this.getCoverImage.bind(this);
    }

    componentDidMount() {
        let self = this;

        Fetcher(self.state.url).then(function(response){
            if(!response.error){
                self.setState({service : response});
            }
            self.setState({loading:false});
        })

        this.getCoverImage();
    }

    getCoverImage(){
        let self = this;
        fetch(`/api/v1/service-templates/${this.props.params.serviceId}/image`).then(function(response) {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        }).then(function(myBlob) {
            let objectURL = URL.createObjectURL(myBlob);
            self.setState({image: objectURL});
        }).catch(function(error) {

        });
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

    render(){

        let service = this.state.service;
        let urlQuery = this.props.location.query;

        let boxColor = { h: 0, s: 0, l: 100};
        let boxColor2 = { h: boxColor.h, s: boxColor.s, l: boxColor.l};
        let cardStyle = {
            backgroundColor: 'hsl('+boxColor.h+', '+boxColor.s+'%, '+boxColor.l+'%)',
        };
        let cardFooterStyle = {
            backgroundColor: 'hsl('+boxColor2.h+', '+boxColor2.s+'%, '+boxColor2.l+'%)',
        };

        let isColor = new RegExp('(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)', 'i');
        let tempColor = '';

        if(urlQuery.bodyColor !== 'undefined'){
            tempColor = `#${urlQuery.bodyColor}`;
            if(isColor.test(tempColor)){
                cardStyle = {backgroundColor: tempColor};
            }
        }
        if(urlQuery.footerColor !== 'undefined'){
            tempColor = `#${urlQuery.footerColor}`;
            if(isColor.test(tempColor)){
                cardFooterStyle = {backgroundColor: tempColor};
            }
        }

        let borderRadius = { borderRadius: '0px'};
        if(urlQuery.borderRadius !== 'undefined'){
            if(parseInt(urlQuery.borderRadius) !== NaN){
                cardStyle.borderRadius = `${urlQuery.borderRadius}px`;
                cardFooterStyle.borderRadius = `${urlQuery.borderRadius}px`;
            }else{
                console.error("borderRadius must be a number.")
            }
        }

        let textColor = { color: '#000000'};
        if(urlQuery.textColor !== 'undefined'){
            tempColor = `#${urlQuery.textColor}`;
            if(isColor.test(tempColor)){
                textColor = { color: tempColor};
            }
        }

        let requestButton = urlQuery.requestButton || "Request";

        let headerStyle = {}
        if(this.state.image){
            headerStyle = {"backgroundImage" : `url('${this.state.image}')`, "backgroundSize":"cover", "backgroundPosition":"center center", "color": "#fff", "height": "150px"};
        }else{
            headerStyle = {"backgroundColor" : urlQuery.headerColor || this.getRandomColor(), "color": "#fff", "height": "150px"};
        }

        if(this.state.loading){
            return( <Load/> );
        }else{
            return (
                <div id="embed">
                    <div id={`service-${service.id}`} className="card service dark" style={cardStyle}>

                        <div className={`card-image-holder ${this.state.image ? 'image' : 'no-image'}`} style={headerStyle}>

                                {/*service.references.service_categories[0].name*/}
                        </div>

                        <div className={`card-block ${typeof(urlQuery.icon) === true && 'with-icon'}`}>

                            {/*{(typeof(urlQuery.noIcon) === 'undefined') &&*/}
                            {/*<img className="service-icon" src={`/api/v1/service-templates/${this.props.params.serviceId}/image?${new Date().getTime()}`}/>*/}
                            {/*}*/}

                            <div className="card-title-holder">
                                <h4 className="card-title" style={textColor}>{service.name}</h4>

                                {typeof(urlQuery.noDate) === 'undefined' &&
                                <small className="meta" style={textColor}>Published on: {<DateFormat date={service.created_at}/>}</small>
                                }
                            </div>

                            <div className="clearfix"></div>
                        </div>
                        <div className="card-body">

                            {typeof(urlQuery.fullDescription) === 'undefined' ?
                                <p style={textColor}>{_.truncate(service.description, {length: 200, omission: '...'})}</p> :
                                <p style={textColor}>{service.description}</p>
                            }

                        </div>
                        <div className="card-footer" style={cardFooterStyle}>

                            {typeof(urlQuery.noCost) === 'undefined' &&
                            <span className="seller pull-left" style={textColor}>
                                <span className="price">{getPrice(service)}</span>
                            </span>
                            }

                            <Link style={textColor} to={`/service-catalog/${this.props.params.serviceId}/request`} className="btn btn-white btn-flat pull-right" target="_blank">{requestButton}</Link>
                        </div>
                    </div>
                </div>
            );
        }

    }
}

export default Embed;



