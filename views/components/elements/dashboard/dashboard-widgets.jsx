import React from 'react';
import './css/style.css';
import {browserHistory} from 'react-router';
import Price from '../../utilities/price.jsx';

class Widget extends React.Component {

    constructor(props){
        super(props);
        this.state = {data: this.props.data};

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
        return (
            <div className={`dashboard-widget ${this.getCSSClass()}`} onClick={this.goTo}>
                <div className="widget-label">{this.state.data.label}</div>
                <div className="widget-data">{this.getFormatted(this.state.data.value)}</div>
            </div>
        );
    }
}

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

export {Widget, DashboardWidgets};
export default DashboardWidgets;