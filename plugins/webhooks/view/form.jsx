import React from 'react';
import Fetcher from "../../../views/components/utilities/fetcher.jsx"
import ServiceBotBaseForm from "../../../views/components/elements/forms/servicebot-base-form.jsx";
import {inputField} from "../../../views/components/elements/forms/servicebot-base-field.jsx";
import Alerts from '../../../views/components/elements/alerts.jsx';
import {required, url} from 'redux-form-validators'
import {Field,} from 'redux-form'
import Buttons from "../../../views/components/elements/buttons.jsx";
import Modal from '../../../views/components/utilities/modal.jsx';
import Jumbotron from '../../../views/components/layouts/jumbotron.jsx';
import '../stylesheets/webhooks.css';


function WebhookForm(props) {
    return (
        <form>
            <Field name="endpoint_url" type="text" validate={[required(), url()]} component={inputField} placeholder="Endpoint URL: https://"/>
            {/*<Field name="async_lifecycle" type="select" component={inputField} placeholder="Asynchronous"/>*/}
            <Field className="form-control" name="async_lifecycle" component="select">
                <option value="True">Asynchronous</option>
                <option value="False">synchronous</option>
            </Field>
            <div className="text-right m-t-15">
                <Buttons btnType="primary" text="Add endpoint" onClick={props.handleSubmit} type="submit" value="submit"/>
            </div>
        </form>
    )
}

function WebhookModal(props){
    let {show, hide, hook, handleSuccessResponse, handleFailureResponse} = props;
    let submissionRequest = {
        'method': hook.id ? "PUT" : 'POST',
        'url': hook.id ? `/api/v1/webhooks/${hook.id}` : `/api/v1/webhooks`
    };


    return (
        <Modal modalTitle={"Add endpoint"} icon="fa-plus" hideCloseBtn={false} show={show} hide={hide} hideFooter={false}>
            <div className="p-20">
                <ServiceBotBaseForm
                    form={WebhookForm}
                    initialValues={{...hook}}
                    submissionRequest={submissionRequest}
                    successMessage={"Fund added successfully"}
                    handleResponse={handleSuccessResponse}
                    handleFailure={handleFailureResponse}
                    reShowForm={true}
                />
            </div>
        </Modal>
    )

}

function Webhook(props){
    console.log("ffff")
    console.log(props.hook)
    let hook = props.hook;
    return (<div>
        Endpoint: {hook.endpoint_url}
        Is Async: {hook.async_lifecycle}
        Health: {hook.health}
    </div>)
}

class Webhooks extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
            openHook : false,
            hook : null,
            hooks : [],
            loading : true

        }
        this.fetchData = this.fetchData.bind(this);
        this.openHookForm = this.openHookForm.bind(this);
        this.closeHookForm = this.closeHookForm.bind(this);
        this.deleteHook = this.deleteHook.bind(this);
        this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
        this.handleFailureResponse = this.handleFailureResponse.bind(this);
        this.testHooks = this.testHooks.bind(this);

    }

    async componentDidMount() {
        let self = this;
        let hooks = await Fetcher(`/api/v1/webhooks/`);
        self.setState({hooks, loading: false});
    }


    /**
     * Fetches Table Data
     * Sets the state with the fetched data for use in ServiceBotTableBase's props.row
     */
    fetchData() {
        let self = this;
        return Fetcher('/api/v1/webhooks').then(function (response) {
            if (!response.error) {
                self.setState({hooks: response});
            }
            self.setState({loading: false});
        });
    }

    /**
     * Modal Controls
     * Open and close modals by setting the state for rendering the modals,
     */
    openHookForm(hook){
        this.setState({ openHook: true, hook });
    }

    deleteHook(hook){
        let self = this;
        Fetcher('/api/v1/webhooks/' + hook.id, "DELETE").then(function (response) {
            if (!response.error) {
                self.fetchData();
            }
        });

    }

    closeHookForm(){
        this.fetchData();
        this.setState({ openHook: false, hook: {}, lastFetch: Date.now()});
    }
    async testHooks(){
        this.setState({loading: true});
        let result = await Fetcher("/api/v1/webhooks/test", "POST");
        return await this.fetchData();
    }




    handleSuccessResponse(response) {
        this.setState({
            openHook: false, hook: {}, lastFetch: Date.now(),
            alerts: {
                type: 'success',
                icon: 'check',
                message: 'Your card has been updated.'
            }});
        //re-render
        this.fetchData();
    }

    handleFailureResponse(response) {
        if (response.error) {
            this.setState({ alerts: {
                    type: 'danger',
                    icon: 'times',
                    message: response.error
                }});
        }
    }
    render() {
        let self = this;
        let {openHook, hook, hooks, loading} = this.state;
        let pageName = 'Integration';
        let subtitle = 'Integrate your SaaS with Servicebot webhooks';

        let getAlerts = ()=>{
            if(this.state.alerts){
                return ( <Alerts type={this.state.alerts.type} message={this.state.alerts.message}
                                 position={{position: 'fixed', bottom: true}} icon={this.state.alerts.icon} /> );
            }
        };

        const endpointModals = ()=>{
            if(openHook){
                return (<WebhookModal handleSuccessResponse={self.handleSuccessResponse}
                                      handleFailureResponse={self.handleFailureResponse}
                                      hook={hook}
                                      show={self.openHookForm}
                                      hide={this.closeHookForm}/>)
            } else {
                return null;
            }
        }

        return (
            <div>
                <Jumbotron pageName={pageName} subtitle={subtitle} />
                <div className="page-servicebot-webhooks col-xs-12 col-sm-12 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2" id="payment-form">
                    <h3>Webhooks</h3>
                    <span>Servicebot can send webhook events that notify your application any time an event happens.
                        This is especially useful for events—like new customer subscription or trial expiration—that
                        your SaaS product needs to know about. You can integrate your SaaS with Servicebot by listening
                        to API calls sent from your Servicebot instance to your SaaS product.</span>
                    <hr/>
                    <div className="hook-actions m-b-15">
                        <button className="btn btn-default m-r-5" onClick={self.testHooks} type="submit" value="submit">{loading ? <i className="fa fa-refresh fa-spin"></i> : <i className="fa fa-refresh"></i>} Re-test endpoints</button>
                        <button className="btn btn-primary m-r-5" onClick={()=>{self.openHookForm({})}} type="submit" value="submit"><i className="fa fa-plus"></i> Add endpoint</button>
                    </div>
                    <div className="form-row">
                        {hooks.map((hook, index) => {
                            console.log(hook)
                            //Set health check
                            let health = <span><span className="status-badge red"><i className="fa fa-times"></i></span> {hook.health}</span>;
                            if(!hook.health) {
                                health = <span className="status-badge neutral">Test Endpoints</span>;
                            } else if(hook.health === 'OK') {
                                health = <span className="status-badge green"><i className="fa fa-check"></i></span>;
                            }
                            //Set Type
                            let type = <span className="status-badge blue m-r-5">Asynchronous</span>;
                            if(hook.async_lifecycle === false){
                                type = <span className="status-badge purple m-r-5">Synchronous</span>;
                            }
                            return (
                                <div className="hook" key={"hook-" + index}>
                                    <div className="url">{hook.endpoint_url}</div>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <span>{type}</span>
                                            <span>{health}</span>
                                        </div>
                                        <div className="hook-actions col-md-4">
                                            <button className="btn-xs m-r-5" onClick={()=>{self.openHookForm(hook)}} type="submit" value="submit"><i className="fa fa-pencil"></i> Edit</button>
                                            <button className="btn-xs" onClick={()=>{self.deleteHook(hook)}} type="submit" value="submit"><i className="fa fa-times"></i> Delete</button>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}

                    </div>
                    {endpointModals()}
                </div>
            </div>

        );
    }
}



let RouteDefinition =     {component : Webhooks, name : "Webhooks", path : "/webhooks", isVisible : function(user){
    console.log(user);
    //todo: this is dirty, need to do permission based...
        return user.role_id === 1
    }};

export default RouteDefinition