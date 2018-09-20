import React from "react";
import cookie from "react-cookie";
import {Fetcher, inputField, iconToggleField, ServicebotBaseForm} from "servicebot-base-form";
import {change, Field, FieldArray, FormSection, formValueSelector, getFormValues} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, widgets} from "../../../views/components/utilities/widgets";
import slug from "slug"
import {numericality, required} from 'redux-form-validators'
const CHECKOUT_FORM = "checkoutForm";
const selector = formValueSelector(CHECKOUT_FORM); // <-- same as form name
import { duotoneDark } from 'react-syntax-highlighter/styles/prism';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Load from '../../../views/components/utilities/load.jsx';

class CustomField extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillReceiveProps(nextProps) {
        let props = this.props;
        if ((nextProps.myValues.type !== props.myValues.type) && (nextProps.length === props.length)) {
            props.clearConfig();
            props.clearValue();
        }
        if ((props.templateType && nextProps.templateType !== props.templateType)) {
            props.clearPricing();
        }
    }

    render() {

        let props = this.props;
        let {
            willAutoFocus, index, typeValue, member, myValues, privateValue, requiredValue, promptValue, configValue,
            setPrivate, setRequired, setPrompt, changePrivate, changeRequired, changePrompt, templateType
        } = props;

        if (myValues.prop_label) {
            willAutoFocus = false;
        }
        if(typeValue === "metric"){
            return <div/>
        }
        return (
            <div className="custom-property-fields">
                <div id="custom-prop-name" className="custom-property-field-group">
                    <Field
                        willAutoFocus={willAutoFocus}
                        name={`${member}.prop_label`}
                        type="text"
                        component={inputField}
                        validate={required()}
                        placeholder="Custom Property Label"
                    />
                </div>

                <div id="custom-prop-type" className="custom-property-field-group">
                    <WidgetList name={`${member}.type`} id="type"/>
                </div>

                <div id="custom-prop-settings" className="custom-property-field-group">
                    {!privateValue && !requiredValue &&
                    <Field
                        onChange={changePrompt}
                        setValue={setPrompt}
                        name={`${member}.prompt_user`}
                        type="checkbox"
                        label={promptValue ? "Prompt User" : "Set Prompt User"}
                        defaultValue={true}
                        color="#0091EA"
                        faIcon="eye"
                        component={iconToggleField}
                    />
                    }
                    {!privateValue &&
                    <Field
                        onChange={changeRequired}
                        setValue={setRequired}
                        name={`${member}.required`}
                        type="checkbox"
                        label={requiredValue ? "Required" : "Set Required"}
                        color="#FF1744"
                        faIcon="check"
                        component={iconToggleField}
                    />
                    }
                    {!requiredValue && !promptValue &&
                    <Field
                        onChange={changePrivate}
                        setValue={setPrivate}
                        name={`${member}.private`}
                        type="checkbox"
                        label={privateValue ? "Private" : "Set Private"}
                        color="#424242"
                        faIcon="hand-paper-o"
                        component={iconToggleField}
                    />
                    }
                </div>
                <div id="custom-prop-widget" className="custom-property-field-group">
                    {typeValue && <RenderWidget
                        showPrice={(templateType !== "custom" && templateType !== "split")}
                        member={member}
                        configValue={configValue}
                        widgetType={typeValue}/>
                    }
                </div>
            </div>
        )
    };
}

CustomField = connect((state, ownProps) => {
    return {
        "privateValue": selector(state, "references.service_template_properties")[ownProps.index].private,
        "requiredValue": selector(state, "references.service_template_properties")[ownProps.index].required,
        "promptValue": selector(state, "references.service_template_properties")[ownProps.index].prompt_user,
        "typeValue": selector(state, "references.service_template_properties")[ownProps.index].type,
        "configValue": selector(state, `references.service_template_properties`)[ownProps.index].config,
        "myValues": selector(state, `references.${ownProps.member}`),


    }
}, (dispatch, ownProps) => {
    return {
        "setPrivate": (val) => {
            if (val == true) {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, true));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.required`, false));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, false));
            } else {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, false));
            }
        },
        "setRequired": (val) => {
            if (val == true) {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.required`, true));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, false));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, true));
            } else {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.required`, false));
            }
        },
        "setPrompt": (val) => {
            if (val == true) {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, true));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, false));
            } else {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, false));
            }
        },
        "changePrivate": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.required`, false));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, false));
            }
        },
        "changeRequired": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, false));
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.prompt_user`, true));
            }
        },
        "changePrompt": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.private`, false));
            }
        },
        "clearConfig": () => {
            dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.config`, {}));
        },
        "clearPricing": () => {
            dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.config.pricing`, null));
        },
        "clearValue": () => {
            dispatch(change(CHECKOUT_FORM, `references.${ownProps.member}.data`, null));
        }
    }
})(CustomField);


//Custom property
class renderCustomProperty extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            customFields: [],
        };


        this.onAdd = this.onAdd.bind(this);
    }

    onAdd(e) {
        e.preventDefault();
        const {privateValue, fields, meta: {touched, error}} = this.props;
        return (fields.push({}));
    }

    render() {
        let props = this.props;
        const {templateType, privateValue, fields, meta: {touched, error}} = props;

        return (
            <div>
                <ul className="custom-fields-list">
                    {fields.map((customProperty, index) =>{
                        let property = fields.get(index);
                        if(property.name && property.name.slice(0, 2) === "__"){
                            return <div/>
                        }
                        return (<li className="custom-field-item" key={index}>
                            <div className="custom-field-name">
                                {/*{fields.get(index).prop_label ?*/}
                                {/*<p>{fields.get(index).prop_label}</p> : <p>Field #{index + 1}</p>*/}
                                {/*}*/}
                                <button className="btn btn-rounded custom-field-button iconToggleField"
                                        id="custom-field-delete-button"
                                        type="button"
                                        title="Remove Field"
                                        onClick={() => fields.remove(index)}>
                                    <span className="itf-icon"><i className="fa fa-close"/></span>
                                </button>
                            </div>
                            <CustomField length={fields.length} templateType={templateType} member={customProperty} index={index}
                                         willAutoFocus={fields.length - 1 == index}/>
                        </li>)
                    }
                    )}
                    <li className="custom-field-item">
                        <div className="form-group form-group-flex">
                            <input className="form-control custom-property-add-field-toggle" autoFocus={false}
                                   placeholder="Add Custom Field ..." onClick={this.onAdd}/>
                        </div>
                        {/*<button className="btn btn-rounded" type="button" onClick={this.onAdd}>Add Field</button>*/}
                        {touched && error && <span>{error}</span>}
                    </li>
                </ul>
            </div>
        )
    };
}

let CheckoutForm = function(props){
    return <div>
        <FormSection name="references">
            <FieldArray name="service_template_properties"
                        props={{templateType: props.serviceTypeValue}}
                        component={renderCustomProperty}
            />
            <button className="buttons _primary _right" onClick={props.handleSubmit} >Save Checkout Form</button>
            <span class="clear"/>
        </FormSection>
    </div>
};


//The full form





class CheckoutPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            selectedTemplate: 0,
            selectedTier: null,
            selectedPlan: null,
            tier: null,
            templates: [],
            copied: false,
        }
        this.changeTemplate = this.changeTemplate.bind(this);
        this.changeTier = this.changeTier.bind(this);
        this.changePlan = this.changePlan.bind(this);
        this.generateEmbedCode = this.generateEmbedCode.bind(this);
        this.handleCopy = this.handleCopy.bind(this);

    }
    generateEmbedCode(){
        let {selectedPlan, selectedTemplate} = this.state;
        return `<div id="servicebot-request-form"></div>
                <script src="https://js.stripe.com/v3/"></script>
                <script src="https://js.servicebot.io/js/servicebot-checkout-embed.js" type="text/javascript"></script>
                <script  type="text/javascript">
                    Servicebot.Checkout({
                        templateId : ${selectedTemplate},
                        paymentStructureTemplateId: ${selectedPlan},
                        url : "${window.location.origin}",
                        selector : document.getElementById('servicebot-request-form'),
                        handleResponse : (response) => {
                            //Response function, you can put redirect logic or app integration logic here
                        },
                        forceCard : false, //set to true if you want credit card to be a required field for the customer, even for free trials
                        setPassword : false //set to true if you want customer to fill out a password
                    })
                </script>`
    }
    async componentDidMount(){
        let templates = await Fetcher(`/api/v1/service-templates/`);
        this.setState({ templates, loading: false});
    }
    changeTemplate(e) {
        const selectedTemplate = e.currentTarget.value;
        this.setState({selectedTemplate, selectedTier: null, selectedPlan: null});

    }
    async changeTier(e) {
        const selectedTier = e.currentTarget.value;
        let tier = await Fetcher(`/api/v1/tiers/${selectedTier}`);
        this.setState({selectedTier, tier, selectedPlan: null});

    }
    changePlan(e) {
        const selectedPlan = e.currentTarget.value;
        this.setState({selectedPlan});

    }
    handleCopy(){
        let self = this;
        this.setState({'copied': true}, function () {
            setTimeout(function(){ self.setState({'copied': false}) }, 3000);
        });
    }

    render(props) {
        let formHTML;
        let {loading, selectedTemplate, templates, selectedPlan, selectedTier, tier, copied} = this.state;
        if(loading){
            return <Load/>;
        }

        if (selectedTemplate === null || selectedTemplate == 0) {
            formHTML = "Select a service from the list to embed"
        }
        let  submissionRequest = {
            'method': 'PUT',
            'url': `/api/v1/service-templates/${selectedTemplate}`
        };
        let currentTemplate = templates.find(template => template.id == selectedTemplate)
        let formEmbed = (
            <div id="plugin_embeddable-checkout" className="plugin_container">
                <div id="_section-1" className="_section _active">
                    <span className="caret"/>
                    <h3><span className="form-step-count">1</span>Select a service</h3>
                    <div className="_indented">
                        <select className="form-control" onChange={this.changeTemplate}>
                            <option key={"default-0"} value="0">Select a service</option>
                            {this.state.templates.map(template => {
                                return (<option key={template.id} value={template.id}>{template.name}</option>)
                            })}
                        </select>
                    </div>
                </div>
                <div id="_section-2" className={`_section ${selectedTemplate && '_active'}`}>
                    <span className="caret"/>
                    <h3><span className="form-step-count">2</span>Build your checkout form</h3>
                    <div className="_indented">
                        { selectedTemplate ?
                            <ServicebotBaseForm key={"base-"+selectedTemplate}
                                                form={CheckoutForm}
                                                formName={CHECKOUT_FORM}
                                                initialValues={currentTemplate}
                                                reShowForm={true}
                                                submissionRequest={submissionRequest}
                                                successMessage={"Checkout form updated"}
                            /> :
                            <div className="_inactive"/>
                        }
                    </div>
                </div>
                <div id="_section-3" className={`_section ${selectedTemplate && '_active'}`}>
                    <span className="caret"/>
                    <h3><span className="form-step-count">3</span>Copy and Embed your code</h3>
                { selectedTemplate ?
                    <div>
                        <div className="_indented">
                            <p className="form-help-text"> Paste the generated HTML on the page you want to embed
                                a request form. You can find more detailed documentation
                                <a href="https://docs.servicebot.io/checkout-embed"> here</a>
                            </p>

                            <div className="_embed-code-form">
                                <div id="_select-a-tier" className="form-group form-group-flex">
                                    <label className="control-label form-label-flex-md">Select a tier</label>
                                    <select className="form-control" onChange={this.changeTier}>
                                        <option key={"default-0"} value="0">Select a tier</option>
                                        {currentTemplate.references.tiers.map(tier => {
                                            return (<option key={tier.id} value={tier.id}>{tier.name}</option>)
                                        })}
                                    </select>
                                </div>
                                {selectedTier &&
                                <div id="_select-a-plan" className="form-group form-group-flex">
                                    <label className="control-label form-label-flex-md">Select a plan</label>
                                    <select className="form-control" onChange={this.changePlan}>
                                        <option key={"default-0"} value="0">Select a plan</option>
                                        {tier.references.payment_structure_templates.map(plan => {
                                            return (<option key={plan.id} value={plan.id}>{`${plan.amount/100} - ${plan.interval} - ${plan.type}`}</option>)
                                        })}
                                    </select>
                                </div>
                                }
                            </div>
                        </div>
                        {selectedPlan &&
                        <div className="_embed-code-copy">
                            <SyntaxHighlighter showLineNumbers language='javascript' style={duotoneDark}>{this.generateEmbedCode()}</SyntaxHighlighter>
                            <CopyToClipboard text={this.generateEmbedCode()} onCopy={this.handleCopy}>
                                <button className="buttons _success _right __copied">{copied ? 'Copied!' : 'Copy Embed Code'}</button>
                            </CopyToClipboard>
                            <div className="clear"/>
                        </div>
                        }
                    </div> :
                    <div className="_inactive"/>
                }
                </div>
            </div>
        );
        return formEmbed

    }
}
export default {component : CheckoutPage, name: "Checkout Page", description: "Get checkout embed code", iconUrl: "data:image/svg+xml;utf8,<svg width=\"56px\" height=\"56px\" viewBox=\"0 0 56 56\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
"    <!-- Generator: Sketch 49 (51002) - http://www.bohemiancoding.com/sketch -->\n" +
"    <title>SB/Icon/EmbedPage/Checkout</title>\n" +
"    <desc>Created with Sketch.</desc>\n" +
"    <defs></defs>\n" +
"    <g id=\"SB/Icon/EmbedPage/Checkout\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n" +
"        <g id=\"Group-5\" transform=\"translate(3.000000, 5.000000)\" fill=\"#4C82FC\" fill-rule=\"nonzero\">\n" +
"            <g id=\"shopping-cart-(2)\" transform=\"translate(7.000000, 20.000000)\">\n" +
"                <path d=\"M10.5454545,28 C9.27066263,28 8.22727273,26.9823094 8.22727273,25.7142857 C8.22727273,24.4462621 9.27066263,23.4285714 10.5454545,23.4285714 C11.8202465,23.4285714 12.8636364,24.4462621 12.8636364,25.7142857 C12.8636364,26.9823094 11.8202465,28 10.5454545,28 Z M10.5454545,26 C10.7266861,26 10.8636364,25.8664229 10.8636364,25.7142857 C10.8636364,25.5621486 10.7266861,25.4285714 10.5454545,25.4285714 C10.364223,25.4285714 10.2272727,25.5621486 10.2272727,25.7142857 C10.2272727,25.8664229 10.364223,26 10.5454545,26 Z\" id=\"Oval\"></path>\n" +
"                <path d=\"M25.0454545,28 C23.7706626,28 22.7272727,26.9823094 22.7272727,25.7142857 C22.7272727,24.4462621 23.7706626,23.4285714 25.0454545,23.4285714 C26.3202465,23.4285714 27.3636364,24.4462621 27.3636364,25.7142857 C27.3636364,26.9823094 26.3202465,28 25.0454545,28 Z M25.0454545,26 C25.2266861,26 25.3636364,25.8664229 25.3636364,25.7142857 C25.3636364,25.5621486 25.2266861,25.4285714 25.0454545,25.4285714 C24.864223,25.4285714 24.7272727,25.5621486 24.7272727,25.7142857 C24.7272727,25.8664229 24.864223,26 25.0454545,26 Z\" id=\"Oval\"></path>\n" +
"                <path d=\"M4.45709374,1 L0,1 C-0.55228475,1 -1,0.55228475 -1,0 C-1,-0.55228475 -0.55228475,-1 0,-1 L5.27272727,-1 C5.74753002,-1 6.15687292,-0.666126203 6.25231542,-0.201015056 L7.4075267,5.42857143 L29,5.42857143 C29.6292879,5.42857143 30.1021686,6.00286312 29.9814173,6.62045711 L27.8707983,17.4152568 C27.5249015,19.1138449 25.9908453,20.3183435 24.2545455,20.2857143 L11.4605067,20.2855396 C9.70551832,20.3183435 8.17146209,19.1138449 7.82586639,17.4167293 L5.62213392,6.67748295 C5.61423177,6.64663604 5.6077642,6.61521541 5.6028063,6.58329545 L4.45709374,1 Z M7.81793385,7.42857143 L9.78534373,17.0161718 C9.93702627,17.7610362 10.6244939,18.3008169 11.4418182,18.2857143 L24.273234,18.2858889 C25.0718697,18.3008169 25.7593374,17.7610362 25.9094918,17.0238286 L27.7855465,7.42857143 L7.81793385,7.42857143 Z\" id=\"Shape\"></path>\n" +
"            </g>\n" +
"            <path d=\"M2.5,25.941402 C2.5,26.4936867 2.05228475,26.941402 1.5,26.941402 C0.94771525,26.941402 0.5,26.4936867 0.5,25.941402 L0.5,4.1 C0.5,2.1117749 2.1117749,0.5 4.1,0.5 L45.6546075,0.5 C47.6428326,0.5 49.2546075,2.1117749 49.2546075,4.1 L49.2546075,36.9 C49.2546075,38.8882251 47.6428326,40.5 45.6546075,40.5 L41.3189127,40.5 C40.7666279,40.5 40.3189127,40.0522847 40.3189127,39.5 C40.3189127,38.9477153 40.7666279,38.5 41.3189127,38.5 L45.6546075,38.5 C46.5382631,38.5 47.2546075,37.7836556 47.2546075,36.9 L47.2546075,4.1 C47.2546075,3.2163444 46.5382631,2.5 45.6546075,2.5 L4.1,2.5 C3.2163444,2.5 2.5,3.2163444 2.5,4.1 L2.5,25.941402 Z\" id=\"Path-6\"></path>\n" +
"            <path d=\"M6,7.5 C5.17157288,7.5 4.5,6.82842712 4.5,6 C4.5,5.17157288 5.17157288,4.5 6,4.5 C6.82842712,4.5 7.5,5.17157288 7.5,6 C7.5,6.82842712 6.82842712,7.5 6,7.5 Z M6,6.5 C6.27614237,6.5 6.5,6.27614237 6.5,6 C6.5,5.72385763 6.27614237,5.5 6,5.5 C5.72385763,5.5 5.5,5.72385763 5.5,6 C5.5,6.27614237 5.72385763,6.5 6,6.5 Z\" id=\"Oval-4\"></path>\n" +
"            <path d=\"M10,7.5 C9.17157288,7.5 8.5,6.82842712 8.5,6 C8.5,5.17157288 9.17157288,4.5 10,4.5 C10.8284271,4.5 11.5,5.17157288 11.5,6 C11.5,6.82842712 10.8284271,7.5 10,7.5 Z M10,6.5 C10.2761424,6.5 10.5,6.27614237 10.5,6 C10.5,5.72385763 10.2761424,5.5 10,5.5 C9.72385763,5.5 9.5,5.72385763 9.5,6 C9.5,6.27614237 9.72385763,6.5 10,6.5 Z\" id=\"Oval-4-Copy\"></path>\n" +
"            <path d=\"M14,7.5 C13.1715729,7.5 12.5,6.82842712 12.5,6 C12.5,5.17157288 13.1715729,4.5 14,4.5 C14.8284271,4.5 15.5,5.17157288 15.5,6 C15.5,6.82842712 14.8284271,7.5 14,7.5 Z M14,6.5 C14.2761424,6.5 14.5,6.27614237 14.5,6 C14.5,5.72385763 14.2761424,5.5 14,5.5 C13.7238576,5.5 13.5,5.72385763 13.5,6 C13.5,6.27614237 13.7238576,6.5 14,6.5 Z\" id=\"Oval-4-Copy-2\"></path>\n" +
"            <polygon id=\"Path-7\" points=\"1.5 11.5 1.5 9.5 47.457928 9.5 47.457928 11.5\"></polygon>\n" +
"        </g>\n" +
"    </g>\n" +
"</svg>"}