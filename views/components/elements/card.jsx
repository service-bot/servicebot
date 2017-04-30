import React from 'react';
import {Link, browserHistory} from 'react-router';
import _ from "lodash";

class Card extends React.Component {

    constructor(props){
        super(props);
    }

    render(){

        return (
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4">
                <div className="card">
                    <div className="card-top-icon" style={{backgroundColor: this.props.color}}>
                        <img src={this.props.imgUrl + "/" + this.props.id + "/image?" + new Date().getTime()}/>
                    </div>
                    <div className="card-block">
                        <h4 className="card-title">{this.props.name}</h4>
                        <p className="card-text">{_.truncate(this.props.description, {length: 200, omission: '...'})}</p>
                        <Link to={`service-catalog/${this.props.id}/request`} className="btn btn-primary btn-flat btn-rounded pull-right btn-request-service">
                            <i className="fa fa-check m-r-10"/>
                            Request</Link>
                        <div className="clearfix"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Card;



