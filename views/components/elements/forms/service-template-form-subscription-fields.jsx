import React from 'react';
let _ = require("lodash");
import update from "immutability-helper";
import Inputs from "../../utilities/inputs.jsx";
import InfoToolTip from "../tooltips/info-tooltip.jsx";

class ServiceTemplateFormSubscriptionFields extends React.Component {

    constructor(props){
        super(props);
        let templateData = this.props.templateData || {};
        this.state = {  serviceType: this.props.serviceType || '_SUBSCRIPTION',
                        data: {
                            subscription: {
                                amount: templateData.amount || 0,
                                interval: templateData.interval || 'month',
                                interval_count: templateData.interval_count || 1,
                                subscription_prorate: templateData.subscription_prorate || true,
                                type: 'subscription'
                            },
                            one_time: {
                                amount: templateData.amount || 0,
                                interval: 'day',
                                interval_count: 1,
                                subscription_prorate: false,
                                type: 'one_time',
                            },
                            custom: {
                                amount: 0,
                                interval: 'day',
                                interval_count: 1,
                                subscription_prorate: false,
                                type: 'custom'
                            }

                        }};

        this.handleChange = this.handleChange.bind(this);
        this.onToggleSubscription = this.onToggleSubscription.bind(this);
        this.getServiceType = this.getServiceType.bind(this);

    }

    getServiceType(){
        let serviceType = this.state.serviceType;
        let serviceTypeAttribute = "";
        if (serviceType == '_SUBSCRIPTION') {
            serviceTypeAttribute = "subscription";
        }
        else if (serviceType == '_ONE_TIME') {
            serviceTypeAttribute = "one_time";
        }
        else if (serviceType == '_CUSTOM') {
            serviceTypeAttribute = "custom";
        }
        return serviceTypeAttribute;

    }

    componentDidMount(){
        let set = {form: {$merge : this.state.data[this.getServiceType()]}};
        this.props.onChange(null, set);
    }

    handleChange(e){
        if(!_.isObject(e)){
            return;
        }
        let serviceType = this.state.serviceType;
        let set = {data : {}};
        let serviceTypeAttribute = "";
        if (serviceType == '_SUBSCRIPTION') {
            serviceTypeAttribute = "subscription";
        }
        else if (serviceType == '_ONE_TIME') {
            serviceTypeAttribute = "one_time";
        }
        else if (serviceType == '_CUSTOM') {
            serviceTypeAttribute = "custom";
        }
        set.data[serviceTypeAttribute] = {};
        set.data[serviceTypeAttribute][e.target.name] = {$set: e.target.value};

        let formSet = {"form" : {[e.target.name] : {$set : e.target.value}}};
        const newData = update(this.state, set);
        this.props.onChange(null, formSet);
        this.setState(newData);
    }

    onToggleSubscription(e){
        let serviceTypeAttribute = "";
        const serviceType = e.target.value;
        if (serviceType == '_SUBSCRIPTION') {
            serviceTypeAttribute = "subscription";

        }
        else if (serviceType == '_ONE_TIME') {
            serviceTypeAttribute = "one_time";
        }
        else if (serviceType == '_CUSTOM') {
            serviceTypeAttribute = "custom";
        }

        let set = {form: {$merge : this.state.data[serviceTypeAttribute]}};
        this.props.onChange(null, set);
        this.setState({serviceType : e.target.value});
    }

    render () {
        let defaultData = this.state.data;

        let serviceType = this.state.serviceType;
        let serviceFields = ()=> {
            if (serviceType == '_SUBSCRIPTION') {
                return (
                    <div className="service-fields">
                        <div className="form-group">
                            {/*<label className="control-label">Service Subscription Amount</label>*/}
                            <Inputs key="subscription_amount" type="price" name="amount" label="Service Subscription Amount" value={defaultData.subscription.amount} onChange={this.handleChange}/>
                            {/*<input className="form-control" type="number" name="amount" value={defaultData.subscription.amount} onChange={this.handleChange}/>*/}
                        </div>
                        <div className="form-group">
                            <label className="control-label">Bill Customer Every <InfoToolTip title={'If selected "Month" for billing cycle, and interval is 3, the customer will be charged every three months.'} text="i" placement="right"/></label>
                            <div className="row">
                                <input className="form-control" type="hidden" name="type" value={defaultData.subscription.type}/>
                                <div className="col-md-4">
                                    <input className="form-control" type="number" name="interval_count" value={defaultData.subscription.interval_count } onChange={this.handleChange}/>
                                </div>
                                <div className="col-md-8">
                                    <select className="form-control" type="select" name="interval" value={defaultData.subscription.interval} onChange={this.handleChange}>
                                        <option value={'day'}>Day</option>
                                        <option value={'week'}>Week</option>
                                        <option value={'month'}>Month</option>
                                        <option value={'year'}>Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/*<div className="form-group">*/}
                            {/*<label className="control-label">Prorated? <InfoToolTip title={''} text="i" placement="right"/></label>*/}
                            {/*<select className="form-control" type="select" name="subscription_prorate" value={defaultData.subscription.subscription_prorate} onChange={this.handleChange}>*/}
                                {/*<option value={true}>Yes</option>*/}
                                {/*<option value={false}>No</option>*/}
                            {/*</select>*/}
                        {/*</div>*/}
                    </div>
                );
            } else if (serviceType == '_ONE_TIME') {
                return (
                    <div className="service-fields">
                        <div className="form-group">
                            {/*<label className="control-label">One-Time Charge Amount</label>*/}
                            <input className="form-control" type="hidden" name="type" value={defaultData.one_time.type}/>
                            <Inputs key="one_time_amount" type="price" name="amount" label="One-Time Charge Amount" value={defaultData.one_time.amount} onChange={this.handleChange}/>
                            {/*<input className="form-control" type="number" name="amount2" value={defaultData.one_time.amount} onChange={this.handleChange}/>*/}
                        </div>
                        <div className="form-group">
                            <input disabled className="form-control" type="hidden" name="interval" value={defaultData.one_time.interval}/>
                        </div>
                        <div className="form-group">
                            <input disabled className="form-control" type="hidden" name="interval_count" value={defaultData.one_time.interval_count}/>
                        </div>
                        <div className="form-group">
                            <input disabled className="form-control" type="hidden" name="subscription_prorate" value={defaultData.one_time.subscription_prorate}/>
                        </div>
                    </div>
                );
            } else if (serviceType == '_CUSTOM') {
                return (
                    <div className="service-fields">
                        <p className="help-block">You will be able to add custom service charges after an instance of this service as been created for a customer.</p>
                        <div className="form-group">
                            <input className="form-control" type="hidden" name="type" value={defaultData.custom.type}/>
                            <input disabled className="form-control" type="hidden" name="amount" value={defaultData.custom.amount}/>
                        </div>
                        <div className="form-group">
                            <input disabled className="form-control" type="hidden" name="interval" value={defaultData.custom.interval}/>
                        </div>
                        <div className="form-group">
                            <input disabled className="form-control" type="hidden" name="subscription_prorate" value={defaultData.custom.subscription_prorate}/>
                        </div>
                    </div>
                );
            }
        };

        return(
            <div>
                <div className="form-group">
                    <label className="control-label">Service Type</label>
                    <select disabled={this.props.formAction == '_EDIT'} className="form-control" type="select" name="service_type" value={this.state.serviceType} onChange={this.onToggleSubscription}>
                        <option value="_SUBSCRIPTION">Subscription Service</option>
                        <option value="_ONE_TIME">One-Time Service</option>
                        <option value="_CUSTOM">Custom Service</option>
                    </select>
                </div>

                {serviceFields()}
            </div>

        );


    }

}

export default ServiceTemplateFormSubscriptionFields;
