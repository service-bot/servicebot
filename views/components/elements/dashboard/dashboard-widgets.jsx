import React from 'react';
import './css/style.css';
import {browserHistory} from 'react-router';
import {Price} from '../../utilities/price.jsx';
import { connect } from 'react-redux';
let _ = require("lodash");
import {hexToRgb, rgbToHex, getDarkenedRGB} from '../../utilities/color-converter.js';

class Widget extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: this.props.data,
        };

        this.goTo = this.goTo.bind(this);
    }

    goTo(){
        browserHistory.push(this.props.to);
    }

    getCSSClass(){
        if(this.props.to){
            return 'linked';
        }
    }

    getFormatted(value){
        if(this.props.type){
            if(this.props.type == 'price'){
                return <Price value={value}/>
            }
        }else{
            return value;
        }
    }

    render(){

        let style = {widgetData:{}, widgetLabel:{}};

        if(this.props.options) {
            let options = this.props.options;
            style.widgetData.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');

            let darkened = getDarkenedRGB(hexToRgb(_.get(options, 'primary_theme_background_color.value', '#000000')));
            let darkenedHex = rgbToHex(darkened.r, darkened.g, darkened.b);
            console.log("the new dark color", darkened);
            style.widgetLabel.backgroundColor = darkenedHex;
            style.widgetLabel.color = _.get(options, 'primary_theme_text_color.value', '#ffffff');
        }

        return (
            <div className={`dashboard-widget ${this.getCSSClass()}`} onClick={this.goTo} style={style.widgetData}>
                <div className="widget-label" style={style.widgetLabel}>{this.state.data.label}</div>
                <div className="widget-data">{this.getFormatted(this.state.data.value)}</div>
            </div>
        );
    }
}

Widget = connect((state) => {return {options:state.options}})(Widget);

class DashboardWidgets extends React.Component {

    constructor(props){
        super(props);
        this.state = {data: this.props.data};
    }

    render(){
        return (
            <div className="dashboard-widgets">
                <Widget data={{label: 'Total Revenue', value: this.state.data.totalSales}} type="price"/>
                <Widget to="/manage-subscriptions/running" data={{label: 'Running Services', value: this.state.data.totalRunningServiceInstances}}/>
                <Widget to="/manage-subscriptions/requested" data={{label: 'Requested Services', value: this.state.data.totalRequestedServiceInstances}}/>
                <Widget to="/manage-subscriptions/waiting_cancellation" data={{label: 'Cancel Requests', value: this.state.data.totalWaitingCancellationServiceInstances}}/>
            </div>
        );
    }

}

export {DashboardWidgets};