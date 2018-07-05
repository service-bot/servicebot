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
import Collapsible from 'react-collapsible';
import '../stylesheets/webhooks.css';
import cookie from "react-cookie";


function ManagementEmbed(props) {
    let server;
    switch (props.value) {
        case "node":
            server = `function generateJWT(email, key) {
    var crypto = require('crypto');
    var hmac = crypto.createHmac('sha256', key); 

    var payload = {
        "email": email
    };
    var header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    function cleanBase64(string) {
        return string.replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_")
    }

    function base64encode(object) {
        return cleanBase64(Buffer.from(JSON.stringify(object)).toString("base64"));
    }

    var data = base64encode(header) + "." + base64encode(payload);
    hmac.update(data);
    return data + "." + cleanBase64(hmac.digest('base64'));
}
var SECRET_KEY = "${props.secretKey}"; //keep this key safe!
var userToken = generateJWT(user.email, SECRET_KEY);`;
            break;
        case "php":
            server = `function generateJWT($email, $secret) {
    function cleanBase64($string) {
        return str_replace("/", "_", str_replace("+", "-", str_replace("=", "", $string)));
    };
    function base64encode($object) {
        return cleanBase64(base64_encode(json_encode($object)));
    };
    $header = new stdClass();
    $header->alg = "HS256";
    $header->typ = "JWT";
    $payload = new stdClass();
    $payload->email = $email;
    $data = base64encode($header) . "." . base64encode($payload);
    return $data . "." . cleanBase64(base64_encode(pack('H*', hash_hmac('sha256', // hash function
    $data,
    $secret
    ))));
}
$SECRET_KEY = "${props.secretKey}";
$userToken = generateJWT($user->email, $SECRET_KEY);
`;
            break;
        case "ruby":
            server = `require "openssl"
require "base64"
require "json"

def generateJWT(email, secret)
  def clearPadding(string)
    string.gsub! "=", ""
    return string
  end

  def encodeClear(obj)
    return clearPadding(Base64.urlsafe_encode64(JSON.generate(obj)))
  end

  header = {:alg => "HS256", :typ => "JWT"}
  payload = {:email => email}
  data = encodeClear(header) + "." + encodeClear(payload)
  return data + "." + clearPadding(Base64.urlsafe_encode64(OpenSSL::HMAC.digest('sha256', secret, data)))
end

SECRET_KEY = "${props.secretKey}" #Keep this key safe!
userToken = generateJWT(user[:email], SECRET_KEY)
`;
            break;
        case "other":
            server = `Generate a JSON Web Token using the following specifications:
    - Algorithm: HS256
    - HMAC Secret: ${props.secretKey}
    - Payload should contain a customer email address, for example: {"email" : "customer-email@example.com"}`;
            break;
        default:
            break;
    }
    let clientCode = `<div id="servicebot-management-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
    Servicebot.init({
        url : "${window.location.origin}",
        selector : document.getElementById('servicebot-management-form'),
        type : "manage",
        token: "INSERT_TOKEN_HERE",
        handleResponse: (response) => {
            //determine what to do on certain events...
        }
    })
</script>`;
    return (
        <div className="sbi--wrapper">
            <h2>Customer account management embed</h2>
            <div className="sbi--serverside">
                <h3 className="sbi--title">Server-side</h3>
                <span className="sbi--subtitle">In order to embed the management so users can add cards, cancel, and resubscribe, you need to generate a token which
                will authenticate your users and be used by the client-side javascript.</span><br/>
                <strong><span>Select a Server-side language or framework: </span></strong>
                <select onChange={props.onChange} value={props.value}>
                    <option value="node">NodeJS</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Rails/Ruby</option>
                    <option value="other">Other</option>
                </select>
                <pre class="sbi--code-sample">{server}</pre>
                <span>
                    <strong>DO NOT EXPOSE THE SECRET KEY TO THE PUBLIC</strong>,
                    make sure not to commit it into version control or send under insecure channels or expose to client
                </span>
            </div>
            <div className="sbi--client">
                <h3 className="sbi-title">Client-side</h3>
                <span className="sbi--subtitle">With the token generated on the server, use this HTML on the client...(with the proper token)</span>
                <pre class="sbi--code-sample">{clientCode}</pre>
            </div>
        </div>
    )
}

function WebhookForm(props) {
    return (
        <form>
            <Field name="endpoint_url" type="text" validate={[required(), url()]} component={inputField}
                   placeholder="Endpoint URL: https://"/>
            {/*<Field name="async_lifecycle" type="select" component={inputField} placeholder="Asynchronous"/>*/}
            <Field className="form-control" name="async_lifecycle" component="select">
                <option value="True">Asynchronous</option>
                <option value="False">Synchronous</option>
            </Field>
            <div className="text-right m-t-15">
                <Buttons btnType="primary" text="Add endpoint" onClick={props.handleSubmit} type="submit"
                         value="submit"/>
            </div>
        </form>
    )
}

function WebhookModal(props) {
    let {show, hide, hook, handleSuccessResponse, handleFailureResponse} = props;
    let submissionRequest = {
        'method': hook.id ? "PUT" : 'POST',
        'url': hook.id ? `/api/v1/webhooks/${hook.id}` : `/api/v1/webhooks`
    };


    return (
        <Modal modalTitle={"Add endpoint"} icon="fa-plus" hideCloseBtn={false} show={show} hide={hide}
               hideFooter={false}>
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

function Webhook(props) {
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
            openHook: false,
            hook: null,
            hooks: [],
            loading: true,
            showEventsInfo: false,
            templates: [],
            secretKey: null,
            selectedTemplate: 0,
            selectedServer: "node"
        }
        this.fetchData = this.fetchData.bind(this);
        this.openHookForm = this.openHookForm.bind(this);
        this.closeHookForm = this.closeHookForm.bind(this);
        this.deleteHook = this.deleteHook.bind(this);
        this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
        this.handleFailureResponse = this.handleFailureResponse.bind(this);
        this.testHooks = this.testHooks.bind(this);
        this.showEvents = this.showEvents.bind(this);
        this.hideEvents = this.hideEvents.bind(this);
        this.showManagement = this.showManagement.bind(this);
        this.hideManagement = this.hideManagement.bind(this);
        this.showForm = this.showForm.bind(this);
        this.hideForm = this.hideForm.bind(this);
        this.changeServer = this.changeServer.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);

    }

    async componentDidMount() {
        let self = this;
        let hooks = await Fetcher(`/api/v1/webhooks/`);
        let templates = await Fetcher(`/api/v1/service-templates/`);
        let secretKey = (await Fetcher(`/api/v1/system-options/secret`)).secret;

        self.setState({hooks, templates, secretKey, loading: false});
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

    deleteHook(hook) {
        let self = this;
        Fetcher('/api/v1/webhooks/' + hook.id, "DELETE").then(function (response) {
            if (!response.error) {
                self.fetchData();
            }
        });

    }

    openHookForm(hook) {
        this.setState({openHook: true, hook});
    }

    closeHookForm() {
        this.fetchData();
        this.setState({openHook: false, hook: {}, lastFetch: Date.now()});
    }

    async testHooks() {
        this.setState({loading: true});
        let result = await Fetcher("/api/v1/webhooks/test", "POST");
        return await this.fetchData();
    }

    changeServer(e) {
        const selectedServer = e.currentTarget.value;
        this.setState({selectedServer});
    }

    changeTemplate(e) {
        const selectedTemplate = e.currentTarget.value;
        this.setState({selectedTemplate});

    }

    handleSuccessResponse(response) {
        this.setState({
            openHook: false, hook: {}, lastFetch: Date.now(),
            alerts: {
                type: 'success',
                icon: 'check',
                message: 'Your card has been updated.'
            }
        });
        //re-render
        this.fetchData();
    }

    handleFailureResponse(response) {
        if (response.error) {
            this.setState({
                alerts: {
                    type: 'danger',
                    icon: 'times',
                    message: response.error
                }
            });
        }
    }

    showEvents() {
        this.setState({showEventsInfo: true});
    }

    hideEvents() {
        this.setState({showEventsInfo: false});
    }

    showForm() {
        this.setState({showFormEmbed: true});
    }

    hideForm() {
        this.setState({showFormEmbed: false});
    }

    showManagement() {
        this.setState({showManagementEmbed: true});
    }

    hideManagement() {
        this.setState({showManagementEmbed: false});
    }


    render() {
        let self = this;
        let {openHook, hook, hooks, loading} = this.state;
        let pageName = 'Integrations';
        let subtitle = 'Integrate apps with Servicebot';

        let getAlerts = () => {
            if (this.state.alerts) {
                return (<Alerts type={this.state.alerts.type} message={this.state.alerts.message}
                                position={{position: 'fixed', bottom: true}} icon={this.state.alerts.icon}/>);
            }
        };

        const endpointModals = () => {
            if (openHook) {
                return (<WebhookModal handleSuccessResponse={self.handleSuccessResponse}
                                      handleFailureResponse={self.handleFailureResponse}
                                      hook={hook}
                                      show={self.openHookForm}
                                      hide={this.closeHookForm}/>)
            } else {
                return null;
            }
        }
        let formHTML;
        if (this.state.selectedTemplate === null || this.state.selectedTemplate == 0) {
            formHTML = "Select a template from the list to embed"
        } else {
            formHTML = `<div id="servicebot-request-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
Servicebot.init({
    templateId : ${this.state.selectedTemplate},
    url : "${window.location.origin}",
    selector : document.getElementById('servicebot-request-form'),
    handleResponse : (response) => {
        //Response function, you can put redirect logic or app integration logic here
    },
    type: "request",
    spk: "${cookie.load("spk")}",
    forceCard : false, //set to true if you want credit card to be a required field for the customer
    setPassword : false //set to true if you want customer to fill out a password
})
</script>`
        }
        let formEmbed = (
            <div className="sbi--wrapper">
                <h2>Customer account management embed</h2>
                <div className="sbi--client-side">
                    <span class="sbi--subtitle">Paste the generated HTML on the page you want to embed a request form. <br/>You can find more detailed in our <a href="https://docs.servicebot.io/embed">documentation</a></span><br/>
                    <strong><span class="sbi--dropdown-label">Select a service to embed: </span></strong>
                    <select onChange={this.changeTemplate}>
                        <option key={"default-0"} value="0">Select a template</option>
                        {this.state.templates.map(template => {
                            return (<option key={template.id} value={template.id}>{template.name}</option>)
                        })}
                    </select>
                    <pre>{formHTML}</pre>
                </div>
            </div>
        );
        return (
            <div>
                <Jumbotron pageName={pageName} subtitle={subtitle}/>
                <div
                    className="page-servicebot-webhooks col-xs-12 col-sm-12 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2"
                    id="payment-form">
                    <h3>Embed</h3>
                    <span>Servicebot has embeddable forms which can facilitate actions such as subscribing, adding a credit card, cancelling, and resubscribing</span>
                    {this.state.showFormEmbed ?
                        <div className="sbi--modal">
                            {formEmbed}
                            <button className="sbi--embed-code-button sbi--ecb--hide" onClick={this.hideForm}>Hide</button>
                        </div> :
                        <div className="sbi--embed-button-wrapper">
                            <span className="sbi--embed-label">Embed to allow customers to request new subscriptions</span>
                            <button className="sbi--embed-code-button" onClick={this.showForm}>Get Embed Code</button>
                        </div>
                    }
                    {this.state.showManagementEmbed ?
                        <div className="sbi--modal">
                            <ManagementEmbed
                                value={this.state.selectedServer}
                                onChange={this.changeServer}
                                secretKey={this.state.secretKey}/>
                            <button className="sbi--embed-code-button sbi--ecb--hide" onClick={this.hideManagement}>Hide</button>
                        </div> :
                        <div className="sbi--embed-button-wrapper">
                            <span className="sbi--embed-label">Embed to allow customers to manage thier account and billing settings</span>
                            <button className="sbi--embed-code-button" onClick={this.showManagement}>Get Embed Code
                            </button>
                        </div>
                    }


                    <h3>Webhooks</h3>
                    <span>Servicebot can send webhook events that notify your application any time an event happens.
                        This is especially useful for events—like new customer subscription or trial expiration—that
                        your SaaS product needs to know about. You can integrate your SaaS with Servicebot by listening
                        to API calls sent from your Servicebot instance to your SaaS product.</span>

                    <div className="sbi--webhook-button-wrapper">
                        <span className="sbi--webhook-label">Add and test your webhooks</span>
                        <button className="sbi--webhook-button" onClick={() => {
                            self.openHookForm({})
                        }} type="submit" value="submit"><i className="fa fa-plus"/> Add endpoint
                        </button>
                        <button className="sbi--webhook-button sbi--wb--retest" onClick={self.testHooks} type="submit"
                                value="submit">{loading ? <i className="fa fa-refresh fa-spin"/> :
                            <i className="fa fa-refresh"/>} Re-test endpoints
                        </button>
                    </div>

                    <div className="service-instance-box navy webhook-info">
                        <div className="service-instance-box-title">
                            <div>Webhook events information</div>
                            <div className="pull-right">
                                {!this.state.showEventsInfo ?
                                    <button className="btn btn-default btn-rounded btn-sm m-r-5 application-launcher"
                                            onClick={this.showEvents}>View events</button>
                                    :
                                    <button className="btn btn-default btn-rounded btn-sm m-r-5 application-launcher"
                                            onClick={this.hideEvents}>Hide events</button>
                                }

                            </div>
                        </div>
                        {this.state.showEventsInfo &&
                        <div className="service-instance-box-content">
                            <p>The webhook system can notify your SaaS application if any of the following events
                                occour:</p>
                            <a href="https://docs.servicebot.io/webhooks/" target="_BLANK">See documentation for payload
                                information</a>
                            <ul>
                                <li><b>Pre-subscription:</b> This event happens right after the customer subscribes to
                                    your service, prior to the subscription request completion.
                                </li>
                                <li><b>Post-subscription:</b> This event happens after the subscription has been
                                    successfully completed.
                                </li>
                                <li><b>Pre-trial expiration:</b> This event happens right after the trial expires, prior
                                    to any expiration processes.
                                </li>
                                <li><b>Post-trial expiration:</b> This event happens after the trial expiration has been
                                    completed.
                                </li>
                                <li><b>Pre-reactivation:</b> This event happens right after the reactivation event
                                    happens, prior to any reactivation processes.
                                </li>
                                <li><b>Post-reactivation:</b> This event happens after eactivation event has been
                                    completed.
                                </li>
                            </ul>
                        </div>
                        }
                    </div>
                    <div className="form-row">
                        {hooks.map((hook, index) => {
                            //Set health check
                            let health = <span><span className="status-badge red"><i
                                className="fa fa-times"></i></span> {hook.health}</span>;
                            if (!hook.health) {
                                health = <span className="status-badge neutral">Test Endpoints</span>;
                            } else if (hook.health === 'OK') {
                                health = <span className="status-badge green"><i className="fa fa-check"></i></span>;
                            }
                            //Set Type
                            let type = <span className="status-badge blue m-r-5">Asynchronous</span>;
                            if (hook.async_lifecycle === false) {
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
                                            <button className="btn-xs m-r-5" onClick={() => {
                                                self.openHookForm(hook)
                                            }} type="submit" value="submit"><i className="fa fa-pencil"></i> Edit
                                            </button>
                                            <button className="btn-xs" onClick={() => {
                                                self.deleteHook(hook)
                                            }} type="submit" value="submit"><i className="fa fa-times"></i> Delete
                                            </button>
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


let RouteDefinition = {
    component: Webhooks, name: "Integrations", path: "/webhooks", isVisible: function (user) {
        //todo: this is dirty, need to do permission based...
        return user.role_id === 1
    }
};

export default RouteDefinition