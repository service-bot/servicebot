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
            let greenHeader = rgbToHex(44,212,130);
            let greenContent = rgbToHex(2,191,99);
            style.widgetLabel.backgroundColor = darkenedHex;
            style.widgetLabel.color = _.get(options, 'primary_theme_text_color.value', '#ffffff');
            if(this.props.green) {
                style.widgetData.backgroundColor = rgbToHex(2,191,99);
                style.widgetLabel.backgroundColor = rgbToHex(44,212,130);
            } else if(this.props.orange) {
                style.widgetData.backgroundColor = rgbToHex(230, 158, 26);
                style.widgetLabel.backgroundColor = rgbToHex(230,177,26);
            } else if(this.props.purple) {
                style.widgetData.backgroundColor = rgbToHex(48,68,206);
                style.widgetLabel.backgroundColor = rgbToHex(88,109,255);
            } else if(this.props.clear) {
                style.widgetData.backgroundColor = 'none';
                style.widgetLabel.backgroundColor = 'none';
                style.widgetLabel.color = rgbToHex(0,0,0);
            }
        }

        return (
            <div className={`dashboard-widget ${this.getCSSClass()}`} onClick={this.goTo} style={style.widgetData}>
                <div className="widget-label" style={style.widgetLabel}>{this.state.data.label}</div>
                {this.state.data.value !== null && <div className="widget-data">{this.getFormatted(this.state.data.value)}<span className="sub">{this.props.postFix}</span></div>}
                {this.state.data.list &&
                    <div className="p-t-10 p-b-10">
                        {this.state.data.list.map(listing =>
                            <div className="row p-l-20 p-r-20">
                                <div className="col-md-10">{listing.label}</div>
                                <div className="col-md-2 text-right">{listing.value}</div>
                            </div>
                        )}
                    </div>
                }
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
        let customerStat = [];
        customerStat.push({label:'Total Users', value:this.state.data.customerStats.total});
        customerStat.push({label:'Active Users', value:this.state.data.customerStats.active});
        customerStat.push({label:'Invited Users', value:this.state.data.customerStats.invited});
        customerStat.push({label:'Users With Funding', value:this.state.data.customerStats.fundsTotal});
        customerStat.push({label:'Flagged Users', value:this.state.data.customerStats.flagged});
        let offeringStat = [];
        offeringStat.push({label:'Total Offerings', value:this.state.data.offeringStats.total});
        offeringStat.push({label:'Subscriptions', value:this.state.data.offeringStats.totalSubscription});
        offeringStat.push({label:'One Times', value:this.state.data.offeringStats.totalOneTime});
        offeringStat.push({label:'Scheduled Payments', value:this.state.data.offeringStats.totalSplit});
        offeringStat.push({label:'Quotes', value:this.state.data.offeringStats.totalQuote});
        let saleStat = [];
        saleStat.push({label:'Total Sales', value:this.state.data.salesStats.overall.total});
        saleStat.push({label:'Customers who Purchased', value:this.state.data.salesStats.overall.customersWithOfferings});
        saleStat.push({label:'Active Sales', value:this.state.data.salesStats.overall.activeSales});
        saleStat.push({label:'Requested Sales', value:this.state.data.salesStats.overall.requested});
        saleStat.push({label:'Waiting Cancellations', value:this.state.data.salesStats.overall.waitingCancellation});
        saleStat.push({label:'Cancelled Sales', value:this.state.data.salesStats.overall.cancelled});

        //Unpaid charge logic
        let orange = false;
        let green = true;
        if(this.state.data.salesStats.overall.remainingCharges > 0) {
            orange = true;
            green = false;
        }
        return (
            <div>
                <div className="dashboard-widgets">
                    <Widget data={{label: 'ARR', value: this.state.data.salesStats.subscriptionStats.annual}} postFix="/yr" type="price"/>
                    <Widget data={{label: 'MRR', value: this.state.data.salesStats.subscriptionStats.month}} postFix="/mo" type="price"/>
                    <Widget data={{label: 'Unpaid Charges', value: this.state.data.salesStats.overall.remainingCharges}} type="price" orange={orange} green={green}/>
                    <Widget data={{label: 'Total Transactions', value: this.state.data.totalSales}} type="price" purple={true}/>
                </div>
                <div className="dashboard-widgets overalls">
                    <Widget data={{label: 'Customer Stat', list: customerStat}} type="price" clear={true}/>
                    <Widget data={{label: 'Offerings Stat', list: offeringStat}} postFix="/mo" clear={true}/>
                    <Widget data={{label: 'Sales Stat', list: saleStat}} postFix="/yr" purple={true}/>
                </div>
            </div>

        );
    }

}

export {DashboardWidgets, Widget};