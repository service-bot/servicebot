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



class CustomField extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillReceiveProps(nextProps) {
        let props = this.props;
        if (nextProps.myValues.type !== props.myValues.type) {
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
        let machineName;

        if (myValues.prop_label) {
            willAutoFocus = false;
            machineName = slug(myValues.prop_label, {lower: true});

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
                    {machineName &&
                    <div className="form-group form-group-flex addon-options-widget-config-input-wrapper">
                        <label className="control-label form-label-flex-md addon-options-widget-config-input-label">Machine
                            Name</label>
                        <pre>{machineName}</pre>
                    </div>}
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
                    {fields.map((customProperty, index) =>
                        <li className="custom-field-item" key={index}>
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
                            <CustomField templateType={templateType} member={customProperty} index={index}
                                         willAutoFocus={fields.length - 1 == index}/>
                        </li>
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
            <button onClick=    {props.handleSubmit}>Save</button>
        </FormSection>
    </div>
}


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
            templates: []
        }
        this.changeTemplate = this.changeTemplate.bind(this);
        this.changeTier = this.changeTier.bind(this);
        this.changePlan = this.changePlan.bind(this);
        this.generateEmbedCode = this.generateEmbedCode.bind(this);

    }
    generateEmbedCode(){
        let {selectedPlan, selectedTemplate} = this.state;
        return `<div id="servicebot-request-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
    Servicebot.Checkout({
        templateId : ${selectedTemplate},
        planId: ${selectedPlan},
        url : "${window.location.origin}",
        selector : document.getElementById('servicebot-request-form'),
        handleResponse : (response) => {
            //Response function, you can put redirect logic or app integration logic here
        },
        spk: "${cookie.load("spk")}",
        forceCard : false, //set to true if you want credit card to be a required field for the customer
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

    render(props) {
        let formHTML;
        let {loading, selectedTemplate, templates, selectedPlan, selectedTier, tier} = this.state;
        if(loading){
            return <div>LOADING</div>;
        }

        if (selectedTemplate === null || selectedTemplate == 0) {
            formHTML = "Select a template from the list to embed"
        }
        let  submissionRequest = {
            'method': 'PUT',
            'url': `/api/v1/service-templates/${selectedTemplate}`
        };
        let currentTemplate = templates.find(template => template.id == selectedTemplate)
        let formEmbed = (<div>
            <span>Paste the generated HTML on the page you want to embed a request form. You can find more detailed documentation <a
                href="https://docs.servicebot.io/embed">here</a></span>
            <select onChange={this.changeTemplate}>
                <option key={"default-0"} value="0">Select a template</option>
                {this.state.templates.map(template => {
                    return (<option key={template.id} value={template.id}>{template.name}</option>)
                })}
            </select>
            {selectedTemplate && <div><ServicebotBaseForm key={"base-"+selectedTemplate}
                                                     form={CheckoutForm}
                                                     formName={CHECKOUT_FORM}
                                                     initialValues={currentTemplate}
                                                     // initialRequests={initialRequests}
                                                     // submissionPrep={this.submissionPrep}
                                                     submissionRequest={submissionRequest}
                                                     // successMessage={successMessage}
                                                     // handleResponse={this.handleResponse}
                                                     // initializer={initializer}
                                                     // formProps={{
                                                     //     ...this.props.fieldDispatches,
                                                     //     ...this.props.fieldState
                                                     // }}

            />

                <select onChange={this.changeTier}>
                    <option key={"default-0"} value="0">Select a tier</option>
                    {currentTemplate.references.tiers.map(tier => {
                        return (<option key={tier.id} value={tier.id}>{tier.name}</option>)
                    })}
                </select>
                {selectedTier && <select onChange={this.changePlan}>
                    <option key={"default-0"} value="0">Select a plan</option>
                    {tier.references.payment_structure_templates.map(plan => {
                        return (<option key={plan.id} value={plan.id}>{`${plan.amount/100} - ${plan.interval} - ${plan.type}`}</option>)
                    })}
                </select>}
                {selectedPlan && <pre>{this.generateEmbedCode()}</pre>}
            </div>}
            </div>)
        return formEmbed

    }
}
export default {component : CheckoutPage, name: "Checkout Page", description: "CHECKOUT!!!"}