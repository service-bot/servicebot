
import React from 'react';
import {Link, browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import Fetcher from "../utilities/fetcher.jsx";
import update from "immutability-helper";
import Authorizer from "../utilities/authorizer.jsx";
import Load from '../utilities/load.jsx';
import fetch from "fetch-retry";
import {DataForm, DataChild} from "../utilities/data-form.jsx";
import Multistep from "../elements/forms/multistep.jsx"
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import "../../../public/stylesheets/xaas/installation.css";
import { initializedState } from "../../store.js"
import { connect } from "react-redux";

class SetupDB extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div>
                <p>
                    Enter your PostgreSQL database information. If you don't have access to a database, you can try the instant
                    <a href="https://servicebot.io/pricing" target="_blank"> ServiceBot cloud hosted solution</a>.
                </p>
                <div className="row">
                        <label className="control-label">Database Host:</label>
                        <input className="form-control" value={this.props.state.db_host} onChange={this.props.inputChange} name="db_host" placeholder="localhost"/>
                </div>
                <div className="row">
                    <label className="control-label">Database Name:</label>
                    <input className="form-control" value={this.props.state.db_name} onChange={this.props.inputChange} name="db_name"/>
                </div>
                <div className="row">
                    <label className="control-label">Database User:</label>
                    <input className="form-control" value={this.props.state.db_user} onChange={this.props.inputChange} name="db_user"/>
                </div>
                <div className="row">
                    <label className="control-label">Database Password:</label>
                    <input className="form-control" type="password" value={this.props.state.db_password} onChange={this.props.inputChange} name="db_password"/>
                </div>
                <div className="row">
                    <label className="control-label">Database Port:</label>
                    <input className="form-control" value={this.props.state.db_port} onChange={this.props.inputChange} name="db_port"/>
                </div>
            </div>
        )
    }
}

class SetupAdmin extends React.Component{
    constructor(props) {
        super(props);


    }

    render(){
        return(
            <div>
                <p>
                    Enter your ServiceBot site configuration.
                </p>
                <div className="row">
                    <label className="control-label">Admin Email:</label>
                    <input required type="email" className="form-control" value={this.props.state.admin_user} onChange={this.props.inputChange} name="admin_user" />
                </div>

                <div className="row">
                    <label className="control-label">Admin Password:</label>
                    <input minLength="4" required className="form-control" type="password" value={this.props.state.admin_password} onChange={this.props.inputChange} name="admin_password"/>
                </div>
                <hr/>

                <div className="row">
                    <label className="control-label">Business Name:</label>
                    <input className="form-control" value={this.props.state.company_name} onChange={this.props.inputChange} name="company_name"/>
                </div>
                <div className="row">
                    <label className="control-label">Business Address:</label>
                    <input className="form-control" value={this.props.state.company_address} onChange={this.props.inputChange} name="company_address"/>
                </div>
                <div className="row">
                    <label className="control-label">Business Phone #:</label>
                    <input type="tel" className="form-control" value={this.props.state.company_phone_number} onChange={this.props.inputChange} name="company_phone_number"/>
                </div>
                <div className="row">
                    <label className="control-label">Business Email:</label>
                    <input type="email" className="form-control" value={this.props.state.company_email} onChange={this.props.inputChange} name="company_email"/>
                </div>
                <div className="row">
                    <label className="control-label">Site URL:</label>
                    <input className="form-control" value={this.props.state.hostname} onChange={this.props.inputChange} name="hostname"/>
                </div>
            </div>
        )
    }

}

class SetupStripe extends React.Component{
    constructor(props) {
        super(props);

    }

    render(){
        return(
            <div>
                <p>
                    ServiceBot is tightly integrated with Stripe. Follow these steps to begin using the system:<br/>
                    1. <a href="https://dashboard.stripe.com/register" target="_blank">Create a Stripe Account</a>. Note: If you already have a stripe account you can skip this step<br/>
                    2. Log in and go to <a href="https://dashboard.stripe.com/account/apikeys" target="_blank">the stripe api page</a>.<br/>
                    3. Ensure that your system is in the mode you want your ServiceBot to be in (Test or Live).<br/>
                    4. Copy and enter here the Publishable Key and Secret Key.<br/>
                    <a href="https://docs.servicebot.io/getting_started/" target="_blank">For more detailed instructions follow this link</a>.<br/>
                </p>
                <div className="row">
                    <label className="control-label">Stripe Secret API Key</label>
                    <input className="form-control" value={this.props.state.stripe_secret} onChange={this.props.inputChange} name="stripe_secret"/>
                </div>
                <div className="row">
                    <label className="control-label">Stripe Publishable API Key</label>
                    <input className="form-control" value={this.props.state.stripe_public} onChange={this.props.inputChange} name="stripe_public"/>
                </div>
                <p>
                    In order to have ServiceBot and Stripe communicate with each other we need to create webhooks in stripe. Follow these steps to enable this:<br/>
                    1. Login and navigate to <a href="https://dashboard.stripe.com/account/webhooks" target="_blank">the webhook page</a>.<br/>
                    2. In the section "Endpoints receiving events from your account" click "Add endpoint".<br/>
                    3. Copy your system url below and enter it in the "URL to be called" field.<br/>
                    <input className="form-control" value={`https://${window.location.hostname}/api/v1/stripe/webhook`} name="webhook-url" disabled/>
                    4. Select the mode chosen during the previous steps (Test or Live) and select "Send all event types".<br/>
                    5. Click "Add endpoint" and we have complete stripe set up.<br/>
                    <a href="https://docs.servicebot.io/getting_started/" target="_blank">For more detailed instructions follow this link</a>.<br/>
                </p>
            </div>
        )
    }

}

class Setup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form : {},
            steps : []
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkDB = this.checkDB.bind(this);
        this.checkStripe = this.checkStripe.bind(this);


    }

    async componentDidMount(){
        let steps = await Fetcher("/api/v1/setup/steps");
        this.setState({steps});
        document.getElementById('servicebot-loader').classList.add('move-out');
        if(this.props.options.text_size){
            browserHistory.push("home");
        }
    }
    componentDidUpdate(previousState, prevProps){

        if(this.props.options.text_size){
            browserHistory.push("home");
        }

    }

    handleSubmit(e=null){
        let self = this;
        if(e != null) {
            console.error(e);
            e.preventDefault();
        }
        self.setState({loading: true});
        Fetcher("/setup", "POST", self.state.form)
            .then(function(result){
                if(!result.error) {
                    self.props.initialize(result.options);
                }else{
                    self.setState({loading: false});

                }
            });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const formState = update(this.state, {
            form: {
                [name] : {$set:value}
            }
        });
        this.setState(formState);
    }
    checkStripe(callback){
        Fetcher("/api/v1/check-stripe", "POST", this.state.form)
            .then(function(result){
                if(!result.error){
                        callback();
                }
                else{
                    //todo: make fields red
                }

            });
    }
    checkDB(callback){
        let self = this;
        Fetcher("/api/v1/check-db", "POST", this.state.form)
            .then(function(result){
                if(!result.error){
                    if(result.empty){
                        callback();
                    }else{
                        self.handleSubmit();
                    }
                }
            });
    }
    render () {
        let pageName = this.props.route.name || 'ServiceBot Setup';
        let breadcrumbs = [{name:'Welcome to ServiceBot', link:'/setup'}];
        if(this.state.steps.length === 0){
            return (<Load/>);
        }
        const stepMap = {
            "database": {
                name: 'Database Connection',
                onNext: this.checkDB,
                component: <SetupDB state={this.state.form} inputChange={this.handleInputChange}/>
            },
            "stripe": {
                name: 'Stripe API Keys',
                onNext: this.checkStripe,
                component: <SetupStripe state={this.state.form} inputChange={this.handleInputChange}/>
            },
            "configuration": {
                name: 'Configuration',
                component: <SetupAdmin state={this.state.form} inputChange={this.handleInputChange}/>
            }
        };

        let steps = this.state.steps.map(step => stepMap[step]);
        return(
            <div style={{backgroundColor: '#0097f1', minHeight: 100+'vh'}}>
                {this.state.loading && <Load/>}
                <div className="installation row">
                    <div className="installation-logo col-md-8">
                        <img src="/assets/logos/logo-installation.png" />
                        <h1>Welcome to ServiceBot Installer</h1>
                    </div>
                    <div className="installation-form col-md-4">
                    <Content>
                        <Alert stack={{limit: 3}} position='bottom'/>
                        <form onSubmit={this.handleSubmit}>
                            {/*{JSON.stringify(this.state.form)}*/}
                            <Multistep  steps={steps}/>
                            <br/>
                        </form>
                    </Content>
                    </div>
                </div>
            </div>
        );
    }
}


let mapDispatch = function(dispatch){
    return { initialize : (initialOptions) => dispatch(initializedState(initialOptions)) }
}

export default connect((state) => {return {"options" : state.options}}, mapDispatch )(Setup);
