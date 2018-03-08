import React from 'react';
import Fetcher from "../../../views/components/utilities/fetcher.jsx"
import ServiceBotBaseForm from "../../../views/components/elements/forms/servicebot-base-form.jsx";
import {inputField} from "../../../views/components/elements/forms/servicebot-base-field.jsx";
import Alerts from '../../../views/components/elements/alerts.jsx';
import {required, url} from 'redux-form-validators'
import {Field,} from 'redux-form'
import Buttons from "../../../views/components/elements/buttons.jsx";
import Modal from '../../../views/components/utilities/modal.jsx';


function WebhookForm(props) {
    return (
        <form>
            <Field name="endpoint_url" type="text" validate={[required(), url()]} component={inputField} placeholder="Name on the card"/>
            <Field name="async_lifecycle" type="text" component={inputField} placeholder="Asynchronous"/>
            <div className="text-right">
                <Buttons btnType="primary" text="Save Card" onClick={props.handleSubmit} type="submit" value="submit"/>
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
        <Modal modalTitle={"Webhook"} icon="fa-credit-card-alt" hideCloseBtn={true} show={show} hide={hide} hideFooter={true}>
            <ServiceBotBaseForm
                form={WebhookForm}
                initialValues={{...hook}}
                submissionRequest={submissionRequest}
                successMessage={"Fund added successfully"}
                handleResponse={handleSuccessResponse}
                handleFailure={handleFailureResponse}
                reShowForm={true}
            />
        </Modal>
    )

}

function Webhook(props){
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


        let getAlerts = ()=>{
            if(this.state.alerts){
                return ( <Alerts type={this.state.alerts.type} message={this.state.alerts.message}
                                 position={{position: 'fixed', bottom: true}} icon={this.state.alerts.icon} /> );
            }
        };
        if(loading){
            return <div>Loading</div>
        }

        if(openHook){
            return (<WebhookModal handleSuccessResponse={self.handleSuccessResponse}
                                  handleFailureResponse={self.handleFailureResponse}
                                  hook={hook}
                                  show={self.openHookForm}
                                  hide={this.closeHookForm}/>)
        }
        return (
            <div id="payment-form">
                <h3><i className="fa fa-credit-card"/>Webhooks</h3>
                <hr/>
                <div className="form-row">
                    {hooks.map((hook, index) => {
                        return (<div key={"hook-" + index}>
                            <Webhook hook={hook}/>
                            <Buttons btnType="primary" text="Edit Hook" onClick={()=>{ self.openHookForm(hook)}} type="submit" value="submit"/>
                            <Buttons btnType="primary" text="Delete Hook" onClick={()=>{self.deleteHook(hook)}} type="submit" value="submit"/>
                        </div>)
                    })}
                    <Buttons btnType="primary" text="New Hook" onClick={()=>{self.openHookForm({})}} type="submit" value="submit"/>
                    <Buttons btnType="primary" text="Test Hooks" onClick={self.testHooks} type="submit" value="submit"/>

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