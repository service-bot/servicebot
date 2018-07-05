import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from '../../utilities/fetcher.jsx';
import RC2 from 'react-chartjs2';
import {browserHistory} from 'react-router';
import './css/charts.css';
let _ = require("lodash");

class ServiceOverTimeChart extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            instances: {},
            containerWidth: this.props.containerWidth,
            chartData: {},
            chartOption: {}
        };

        this.fetchInstances = this.fetchInstances.bind(this);
    }

    componentDidMount(){
        this.fetchInstances();
    }

    fetchInstances(){
        let self = this;
        let url = '/api/v1/service-instances';
        Fetcher(url).then(function (response) {

            if(!response.error) {
                let servicesRunning = _.filter(response, {status:'running'});
                let servicesCancelled = _.filter(response, {status:'cancelled'});

                let months = _.uniq(_.map(servicesRunning, (instance) => instance.created_at.substring(0,7)));
                 months = _.uniq([...months, ..._.map(servicesCancelled, (instance) => instance.updated_at.substring(0,7))]);

                let groupByMonthRunning = _.groupBy(servicesRunning, (instance) => {
                    return instance.created_at.substring(0,7);
                });
                let groupByMonthCancelled = _.groupBy(servicesCancelled, (instance) => {
                    return instance.updated_at.substring(0,7);
                });
                let sortMonthsRunning = months.sort(function(a, b){
                    if(a > b){ return 1; }
                    else if( a < b){ return -1; }
                    else{ return 0;}
                });
                let sortedGroups = sortMonthsRunning.map((month)=>{
                   return groupByMonthRunning[month] || [];
                })
                let serviceCountByMonthRunning = _.map(sortedGroups, (group)=>{return(group.length)});


                let sortedCancelledGroups = sortMonthsRunning.map((month)=>{
                    return groupByMonthCancelled[month] || [];
                })

                let serviceCountByMonthCancelled = _.map(sortedCancelledGroups, (group)=>{return(group.length)});
                let data = {
                    labels: months,
                    datasets: [
                        {
                            label: 'Cancelled Services',
                            data: serviceCountByMonthCancelled,
                            backgroundColor: "rgba(230, 0, 0, .5)",
                            borderColor: 'rgba(240, 0, 118, 1)',
                            pointBorderWidth: 0
                        },
                        {
                            label: 'New Services',
                            data: serviceCountByMonthRunning,
                            backgroundColor: "rgba(0, 230, 118, .5)",
                            borderColor: 'rgba(0, 230, 118, 1)',
                            pointBorderWidth: 0
                        }
                    ]
                };
                let options = {
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    },
                    scales: {
                        yAxes: [{
                            stacked: false
                        }]
                    }
                };

                self.setState({loading: false, instances: response, chartData: data, chartOptions: options});
            }else{
                self.setState({loading: false});
            }
        })
    }

    render(){
        if(this.state.loading){
            return(
                <div> <Load/> </div>
            );
        }else{
            return(
                <div className={`service-created-cancelled-overtime-chart ${this.props.className}`}>
                    <RC2 data={this.state.chartData} options={this.state.chartOptions} type='line'/>
                </div>
            );
        }
    }

}

class ServiceStatusChart extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            instances: {},
            containerWidth: this.props.containerWidth,
            chartData: {},
            chartOption: {}
        };

        this.fetchInstances = this.fetchInstances.bind(this);
    }

    componentDidMount(){
        this.fetchInstances();
    }

    fetchInstances(){
        let self = this;
        let url = '/api/v1/service-instances';
        Fetcher(url).then(function (response) {

            if(!response.error) {
                let statuses = _.uniq(_.map(response, (instance) => instance.status));
                let groupByStatus = _.groupBy(response, (instance) => {
                    return instance.status ? instance.status : other
                });
                let serviceCountByStatus = _.map(groupByStatus, (group)=>{return(group.length)});

                let data = {
                    labels: statuses,
                    datasets: [{
                        data: serviceCountByStatus,
                        backgroundColor: [ "#FF6384", "#36A2EB", "#FFCE56", "#B388FF" ],
                        hoverBackgroundColor: [ "#FF6384", "#36A2EB", "#FFCE56", "#B388FF" ] }]
                };
                let options = {
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    }
                };

                self.setState({loading: false, instances: response, chartData: data, chartOptions: options});
            }else{
                self.setState({loading: false});
            }
        })
    }

    render(){
        if(this.state.loading){
            return(
                <div>
                    <Load/>
                </div>
                );
        }else{
            return(
                <div className={`service-by-status-chart ${this.props.className}`}>
                    <h3 className="chart-title">Services by Status</h3>
                    <RC2 data={this.state.chartData} options={this.state.chartOptions} type='pie'/>
                </div>
            );
        }
    }

}



class BuildChart extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            containerWidth: this.props.containerWidth,
        };
    }

    render(){
        if(this.props.chartData && this.props.chartData.datasets.length === 0 && this.props.chartData.datasets.data.length === 0){
            return(
                <div>
                    <Load/>
                </div>
            );
        }else{
            return(
                <div className={`customer-status-chart ${this.props.className}`}>
                    <RC2 data={this.props.chartData} options={this.props.chartOptions} type='pie'/>
                </div>
            );
        }
    }

}

export {ServiceOverTimeChart, ServiceStatusChart, BuildChart};
