import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import {
    Field,
    Fields,
    FormSection,
    FieldArray,
    reduxForm,
    formValueSelector,
    change,
    unregisterField,
    getFormValues,
    Form
} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, PriceBreakdown, widgets} from "../../utilities/widgets";
import {WysiwygRedux} from "../../elements/wysiwyg.jsx";
import FileUploadForm from "./file-upload-form.jsx";
import {
    inputField,
    selectField,
    OnOffToggleField,
    iconToggleField,
    priceField,
    priceToCents
} from "./servicebot-base-field.jsx";
import {addAlert, dismissAlert} from "../../utilities/actions";
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import SVGIcons from "../../utilities/svg-icons.jsx";
import Load from "../../utilities/load.jsx";

let _ = require("lodash");
import {required, email, numericality, length} from 'redux-form-validators'
import slug from "slug"

const TEMPLATE_FORM_NAME = "serviceTemplateForm"
const selector = formValueSelector(TEMPLATE_FORM_NAME); // <-- same as form name


function renderSplits({fields, meta: {error, submitFailed}}) {

    function onAdd(e) {
        e.preventDefault();
        let number_of_payments = e.target.value
        let number_of_fields = fields.length

        while (number_of_fields < number_of_payments) {
            fields.push({});
            number_of_fields++;
        }
        while (number_of_fields > number_of_payments) {
            fields.pop()
            number_of_fields--;
        }
        return (fields);

    }


    return (
        <div>
            <div className="form-group form-group-flex">
                <lable className="control-label form-label-flex-md">Number of payments</lable>
                <div className="form-input-flex">
                    <input className="form-control" type="number" defaultValue={fields.length} onChange={onAdd}/>
                    {submitFailed && error && <span>{error}</span>}
                </div>
            </div>

            <ul className="split-payment-items">
                {fields.map((member, index) => (
                    <li className="split-payment-item" key={index}>
                        <button className="btn btn-rounded custom-field-button iconToggleField"
                                id="split-payment-delete-button" onClick={() => fields.remove(index)}
                                type="button" title="Remove Payment"><span className="itf-icon"><i
                            className="fa fa-close"/></span></button>

                        <h4>Payment #{index + 1}</h4>
                        <label>Days to charge customer after subscribed</label>
                        <Field
                            name={`${member}.charge_day`}
                            type="number"
                            component={inputField}
                            validate={numericality({'>=': 0.00})}

                        />
                        <Field name={`${member}.amount`} type="number"
                               component={priceField}
                               isCents={true}
                               label="Amount"
                               validate={numericality({'>=': 0.00})}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}


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
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, true));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.required`, false));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, false));
            } else {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, false));
            }
        },
        "setRequired": (val) => {
            if (val == true) {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.required`, true));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, false));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, true));
            } else {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.required`, false));
            }
        },
        "setPrompt": (val) => {
            if (val == true) {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, true));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, false));
            } else {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, false));
            }
        },
        "changePrivate": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.required`, false));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, false));
            }
        },
        "changeRequired": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, false));
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.prompt_user`, true));
            }
        },
        "changePrompt": (event) => {
            if (!event.currentTarget.value || event.currentTarget.value == 'false') {
                dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.private`, false));
            }
        },
        "clearConfig": () => {
            dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.config`, {}));
        },
        "clearPricing": () => {
            dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.config.pricing`, null));
        },
        "clearValue": () => {
            dispatch(change(TEMPLATE_FORM_NAME, `references.${ownProps.member}.data`, null));
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


//The full form


class TemplateForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let props = this.props;

        const changeServiceType = (event, newValue) => {
            if (newValue === 'one_time') {
                props.setIntervalCount();
                props.setInterval();
            }
            else if (newValue === 'custom' || newValue === 'split') {
                props.setIntervalCount();
                props.setInterval();
                props.clearAmount();
            }
        };


        const {handleSubmit, pristine, reset, submitting, error, serviceTypeValue, invalid, formJSON, options} = props;

        const sectionDescriptionStyle = {
            background: _.get(options, 'service_template_icon_background_color.value', '#000000'),
            height: "100px",
            width: "100px",
            padding: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
        };

        return (

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="form-level-errors">
                            {!options.stripe_publishable_key &&
                            <Link to="/stripe-settings"><br/><h4 className="form-error" style={{padding:'10px',paddingLeft:'30px'}}>
                                The Request Of This Service Disabled Until Setup Complete - Click here to complete</h4>
                            </Link>}
                            {error && <div className="form-error">{error}</div>}
                        </div>
                        <div className="form-level-warnings"/>
                        <h3>Service Info</h3>
                        <Field name="name" type="text"
                               component={inputField} label="Product / Service Name"
                               validate={[required()]}
                        />
                        <Field name="description" type="text"
                               component={inputField} label="Summary"
                               validate={[required()]}
                        />
                        <div className="form-group form-group-flex">
                            <Field name="details" type="text"
                                   component={WysiwygRedux} label="Details"
                            />
                        </div>

                        <Field name="published" type="checkbox"
                               defaultValue={true} color="#0091EA" faIcon="check"
                               component={OnOffToggleField} label="Published?"
                        />
                        <Field name="category_id" type="select"
                               component={selectField} label="Category" options={formJSON ? formJSON._categories : []}
                               validate={[required()]}
                        />
                    </div>
                    <div className="col-md-4">
                        <div style={sectionDescriptionStyle}>
                            <SVGIcons id="basic-info-svg" width="40px" height="40px"
                                      fillColor={_.get(options, 'service_template_icon_fill_color.value', '#ffffff')}>
                                <path
                                    d="M421.648,74.336L349.664,2.352C348.216,0.896,346.216,0,344,0H96C73.944,0,56,17.944,56,40v400c0,22.056,17.944,40,40,40    h288c22.056,0,40-17.944,40-40V80C424,77.784,423.104,75.784,421.648,74.336z M352,27.312L396.688,72H352V27.312z M408,440    c0,13.232-10.768,24-24,24H96c-13.232,0-24-10.768-24-24V40c0-13.232,10.768-24,24-24h240v64c0,4.424,3.584,8,8,8h64V440z"/>
                                <path
                                    d="m128 112c-17.648 0-32 14.352-32 32s14.352 32 32 32 32-14.352 32-32-14.352-32-32-32zm0 48c-8.824 0-16-7.176-16-16s7.176-16 16-16 16 7.176 16 16-7.176 16-16 16z"/>
                                <path
                                    d="m128 200c-17.648 0-32 14.352-32 32s14.352 32 32 32 32-14.352 32-32-14.352-32-32-32zm0 48c-8.824 0-16-7.176-16-16s7.176-16 16-16 16 7.176 16 16-7.176 16-16 16z"/>
                                <path
                                    d="m128 288c-17.648 0-32 14.352-32 32s14.352 32 32 32 32-14.352 32-32-14.352-32-32-32zm0 48c-8.824 0-16-7.176-16-16s7.176-16 16-16 16 7.176 16 16-7.176 16-16 16z"/>
                                <path
                                    d="m128 376c-17.648 0-32 14.352-32 32s14.352 32 32 32 32-14.352 32-32-14.352-32-32-32zm0 48c-8.824 0-16-7.176-16-16s7.176-16 16-16 16 7.176 16 16-7.176 16-16 16z"/>
                                <rect x="176" y="152" width="208" height="16"/>
                                <rect x="184" y="40" width="112" height="16"/>
                                <rect x="160" y="72" width="160" height="16"/>
                                <rect x="176" y="240" width="208" height="16"/>
                                <rect x="176" y="328" width="208" height="16"/>
                                <rect x="176" y="416" width="208" height="16"/>
                                <rect x="240" y="120" width="16" height="16"/>
                                <rect x="208" y="120" width="16" height="16"/>
                                <rect x="176" y="120" width="16" height="16"/>
                            </SVGIcons>
                        </div>
                        <p className="help-block">Enter the basic information about your service. Summary will be
                            shown to users in the product / service listing pages, such as the home page featured
                            items. Details will be shown on each individual products / services page.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <hr/>
                        <div className="row">
                            <div className="col-md-8">
                                <h3>Payment Details</h3>
                                <Field name="statement_descriptor" type="hidden"
                                       component={inputField} label="Statement Descriptor"
                                />
                                <Field name="type" id="type"
                                       component={selectField} label="Billing Type" onChange={changeServiceType}
                                       options={[
                                           {id: "subscription", name: "Subscription"},
                                           {id: "split", name: "Scheduled Payments"},
                                           {id: "one_time", name: "One Time"},
                                           {id: "custom", name: "Quote"}
                                       ]}
                                />
                                {(serviceTypeValue === 'subscription' || serviceTypeValue === 'one_time') &&
                                <Field name="amount" type="number"
                                       component={priceField}
                                       isCents={true}
                                       label="Amount"
                                       validate={numericality({'>=': 0.00})}
                                />
                                }

                                {(serviceTypeValue === 'subscription') &&
                                <div>
                                    <Field name="trial_period_days" type="number"
                                           component={inputField} label="Trial Period (Days)"
                                           validate={required()}
                                    />
                                    <div className="form-group form-group-flex">
                                        <label className="control-label form-label-flex-md" htmlFor="type">Bill
                                            Customer Every</label>
                                        <Field name="interval_count" type="number"
                                               component={inputField}
                                               validate={required()}
                                        />
                                        <Field name="interval" id="interval" component={selectField}
                                               options={[
                                                   {id: "day", name: "Day"},
                                                   {id: "week", name: "Week"},
                                                   {id: "month", name: "Month"},
                                                   {id: "year", name: "Year"}
                                               ]}
                                        />
                                    </div>
                                </div>
                                }

                                {(serviceTypeValue === 'custom') &&
                                <div>
                                    <p>Quotes are built for services that are customer specific. If your service is
                                        priced
                                        based on the customer's use-case, use this option. Once the quote service has
                                        been
                                        requested by the customer, you can add charges to the service at anytime.
                                    </p>
                                </div>
                                }

                                {(serviceTypeValue === 'split') &&
                                <div>

                                    <FormSection name="split_configuration">
                                        <FieldArray name="splits"
                                                    props={{templateType: serviceTypeValue}}
                                                    component={renderSplits}/>

                                    </FormSection>

                                </div>
                                }

                            </div>
                            <div className="col-md-4">
                                <div style={sectionDescriptionStyle}>
                                    <SVGIcons id="custom-field-svg" width="40px" height="40px"
                                              fillColor={_.get(options, 'service_template_icon_fill_color.value', '#ffffff')}>
                                        <path
                                            d="m282.95 138.1h-188.63c-5.578 0-10.105 4.52-10.105 10.105 0 5.578 4.527 10.105 10.105 10.105h188.63c5.578 0 10.105-4.527 10.105-10.105 0-5.585-4.527-10.105-10.105-10.105z"/>
                                        <path
                                            d="m282.95 198.74h-188.63c-5.578 0-10.105 4.52-10.105 10.105 0 5.578 4.527 10.105 10.105 10.105h188.63c5.578 0 10.105-4.527 10.105-10.105 0-5.585-4.527-10.105-10.105-10.105z"/>
                                        <path
                                            d="m424.42 138.1h-67.368c-5.578 0-10.105 4.52-10.105 10.105 0 5.578 4.527 10.105 10.105 10.105h67.368c5.578 0 10.105-4.527 10.105-10.105 0-5.585-4.527-10.105-10.105-10.105z"/>
                                        <path
                                            d="m424.42 198.74h-67.368c-5.578 0-10.105 4.52-10.105 10.105 0 5.578 4.527 10.105 10.105 10.105h67.368c5.578 0 10.105-4.527 10.105-10.105 0-5.585-4.527-10.105-10.105-10.105z"/>
                                        <path
                                            d="m420.75 356.95c-6.494-4.749-13.703-7.209-20.662-9.189-0.108-0.027-0.195-0.047-0.303-0.081v-34.383c4.084 1.018 7.197 2.466 9.252 4.083 1.899 1.482 3.126 3.052 3.968 4.803 0.843 1.752 1.307 3.766 1.313 6.218 0 5.578 4.527 10.105 10.105 10.105s10.105-4.527 10.105-10.105c0-5.153-1.058-10.274-3.288-14.929-3.322-7.02-9.27-12.732-16.748-16.351-4.372-2.129-9.317-3.543-14.686-4.42v-3.018c0-5.585-4.527-10.105-10.105-10.105s-10.105 4.52-10.105 10.105v2.56c-3.947 0.525-7.64 1.387-10.975 2.661-8.286 3.12-14.511 8.569-18.318 14.686-3.84 6.13-5.43 12.746-5.436 18.809-0.027 6.272 1.516 12.146 4.473 16.936 2.566 4.204 6.05 7.424 9.728 9.836 6.481 4.21 13.535 6.332 20.366 8.172 0.055 0.013 0.101 0.027 0.148 0.04v37.645c-4.069-0.93-7.249-2.445-9.405-4.278-3.388-2.965-5.039-6.434-5.106-11.304 0-5.585-4.527-10.105-10.105-10.105s-10.105 4.52-10.105 10.105c-0.074 10.321 4.412 20.17 12.254 26.725 6.022 5.093 13.743 8.233 22.467 9.425v2.863c0 5.585 4.527 10.105 10.105 10.105s10.105-4.52 10.105-10.105v-3.214c6.858-0.984 13.407-2.836 19.253-6.447 4.581-2.857 8.65-6.892 11.372-11.978 2.749-5.079 4.102-11.028 4.089-17.375 0.013-6.608-1.421-12.679-4.238-17.772-2.438-4.452-5.839-8.015-9.518-10.723zm-41.154-14.59c-4.473-1.421-8.11-2.991-10.28-4.682-1.529-1.158-2.419-2.23-3.086-3.509-0.646-1.3-1.139-2.978-1.152-5.76-7e-3 -3.362 1.253-7.464 4.278-10.523 1.536-1.557 3.537-2.978 6.447-4.096 1.105-0.425 2.392-0.775 3.793-1.071v29.641zm33.057 50.856c-0.728 1.34-1.637 2.425-2.923 3.463-1.899 1.536-4.749 2.917-8.549 3.86-0.418 0.108-0.95 0.142-1.381 0.236v-31.932c2.244 0.775 4.306 1.589 6.003 2.519 3.065 1.631 5.026 3.328 6.306 5.261 1.26 1.954 2.177 4.386 2.209 8.819-0.014 3.618-0.708 5.988-1.665 7.774z"/>
                                        <path
                                            d="m269.47 309.89h-161.68c-14.82 0-26.948 12.126-26.948 26.948v40.421c0 14.82 12.126 26.947 26.948 26.947h161.68c14.82 0 26.948-12.126 26.948-26.947v-40.421c0-14.822-12.127-26.948-26.947-26.948zm0 74.105h-161.68c-3.651 0-6.737-3.086-6.737-6.737v-40.421c0-3.651 3.086-6.737 6.737-6.737h161.68c3.651 0 6.737 3.086 6.737 6.737v40.421h1e-3c-1e-3 3.651-3.086 6.737-6.737 6.737z"/>
                                        <path
                                            d="m485.05 26.947h-53.895v13.473c0 7.445-6.036 13.473-13.473 13.473-7.438 0-13.473-6.03-13.473-13.473v-13.473h-53.895v13.473c0 7.445-6.036 13.473-13.473 13.473s-13.473-6.03-13.473-13.473v-13.473h-53.895v13.473c0 7.445-6.036 13.473-13.473 13.473s-13.473-6.03-13.473-13.473v-13.473h-53.895v13.473c0 7.445-6.036 13.473-13.473 13.473-7.438 0-13.473-6.03-13.473-13.473v-13.473h-53.899v13.473c0 7.445-6.036 13.473-13.473 13.473s-13.473-6.03-13.473-13.473v-13.473h-53.895c-14.822 0-26.948 12.126-26.948 26.948v404.21c0 14.82 12.126 26.948 26.948 26.948h458.1c14.82 0 26.947-12.126 26.947-26.948v-404.21c0-14.822-12.127-26.948-26.948-26.948zm0 437.9h-458.1c-3.651 0-6.737-3.086-6.737-6.737v-404.21c0-3.651 3.086-6.737 6.737-6.737h34.364c3.126 15.353 16.742 26.947 33.004 26.947s29.884-11.594 33.004-26.947h14.828c3.126 15.353 16.742 26.947 33.004 26.947s29.884-11.594 33.004-26.947h14.828c3.126 15.353 16.742 26.947 33.004 26.947s29.884-11.594 33.004-26.947h14.828c3.126 15.353 16.742 26.947 33.004 26.947s29.884-11.594 33.004-26.947h14.828c3.126 15.353 16.742 26.947 33.004 26.947s29.884-11.594 33.004-26.947h34.391c3.651 0 6.737 3.086 6.737 6.737v404.21h1e-3c-4e-3 3.651-3.09 6.737-6.741 6.737z"/>
                                    </SVGIcons>
                                    {/*<img id="custom-fields-svg" src="/assets/custom_icons/custom_fields.svg"/>*/}
                                </div>
                                <p className="help-block">Setup payment details. This will be how your customers
                                    will be charged. For example, you can setup a recurring charge for your product
                                    / service by setting Billing Type to Subscription and define how often your
                                    customer will get charged automatically.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <hr/>
                        <div className="row">
                            <div className="col-md-8">
                                <h3>Custom Fields</h3>
                                <FormSection name="references">
                                    <FieldArray name="service_template_properties"
                                                props={{templateType: serviceTypeValue}}
                                                component={renderCustomProperty}/>
                                </FormSection>
                                {/*{props.formJSON.references && props.formJSON.references.service_template_properties &&*/}
                                {/*<PriceBreakdown*/}
                                {/*inputs={props.formJSON.references.service_template_properties}/>*/}
                                {/*}*/}
                                <div id="service-submission-box" className="button-box right">
                                    <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go
                                        Back</Link>
                                    <button className="btn btn-rounded btn-primary" type="submit">
                                        Submit
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div style={sectionDescriptionStyle}>
                                    <SVGIcons id="custom-field-svg" width="40px" height="40px"
                                              fillColor={_.get(options, 'service_template_icon_fill_color.value', '#ffffff')}>
                                        <path
                                            d="m448 376c-5.648 0-11.168 1.536-16 4.36v-36.36c0-4.424-3.584-8-8-8h-52.36c2.824-4.832 4.36-10.352 4.36-16 0-17.648-14.352-32-32-32s-32 14.352-32 32c0 5.648 1.536 11.168 4.36 16h-52.36c-4.416 0-8 3.576-8 8v36.36c-4.832-2.824-10.352-4.36-16-4.36-17.648 0-32 14.352-32 32s14.352 32 32 32c5.648 0 11.168-1.536 16-4.36v36.36c0 4.424 3.584 8 8 8h160c4.416 0 8-3.576 8-8v-36.36c4.832 2.824 10.352 4.36 16 4.36 17.648 0 32-14.352 32-32s-14.352-32-32-32zm0 48c-4.512 0-8.72-1.896-11.832-5.36-1.512-1.68-3.672-2.64-5.944-2.64h-6.224c-4.416 0-8 3.576-8 8v40h-144v-40c0-4.424-3.584-8-8-8h-6.224c-2.264 0-4.424 0.96-5.944 2.64-3.112 3.464-7.32 5.36-11.832 5.36-8.824 0-16-7.176-16-16s7.176-16 16-16c4.512 0 8.72 1.896 11.832 5.36 1.512 1.68 3.672 2.64 5.944 2.64h6.224c4.416 0 8-3.576 8-8v-40h56c4.416 0 8-3.576 8-8v-6.224c0-2.264-0.96-4.424-2.64-5.936-3.456-3.12-5.36-7.328-5.36-11.84 0-8.824 7.176-16 16-16s16 7.176 16 16c0 4.512-1.904 8.72-5.36 11.832-1.68 1.52-2.64 3.672-2.64 5.944v6.224c0 4.424 3.584 8 8 8h56v40c0 4.424 3.584 8 8 8h6.224c2.264 0 4.424-0.96 5.944-2.64 3.112-3.464 7.32-5.36 11.832-5.36 8.824 0 16 7.176 16 16s-7.176 16-16 16z"/>
                                        <path
                                            d="m472 0h-464c-4.416 0-8 3.576-8 8v248c0 4.424 3.584 8 8 8h152c4.416 0 8-3.576 8-8v-48c0-4.424-3.584-8-8-8h-6.224c-2.264 0-4.424 0.96-5.944 2.64-3.112 3.464-7.32 5.36-11.832 5.36-8.824 0-16-7.176-16-16s7.176-16 16-16c4.512 0 8.72 1.896 11.832 5.36 1.512 1.68 3.672 2.64 5.944 2.64h6.224c4.416 0 8-3.576 8-8v-40h56c4.416 0 8-3.576 8-8v-6.224c0-2.264-0.96-4.424-2.64-5.936-3.456-3.12-5.36-7.328-5.36-11.84 0-8.824 7.176-16 16-16s16 7.176 16 16c0 4.512-1.904 8.72-5.36 11.832-1.68 1.52-2.64 3.672-2.64 5.944v6.224c0 4.424 3.584 8 8 8h56v40c0 4.424 3.584 8 8 8h6.224c2.264 0 4.424-0.96 5.944-2.64 3.112-3.464 7.32-5.36 11.832-5.36 8.824 0 16 7.176 16 16s-7.176 16-16 16c-4.512 0-8.72-1.896-11.832-5.36-1.512-1.68-3.672-2.64-5.944-2.64h-6.224c-4.416 0-8 3.576-8 8v48c0 4.424 3.584 8 8 8h152c4.416 0 8-3.576 8-8v-248c0-4.424-3.584-8-8-8zm-8 248h-136v-28.36c4.832 2.824 10.352 4.36 16 4.36 17.648 0 32-14.352 32-32s-14.352-32-32-32c-5.648 0-11.168 1.536-16 4.36v-36.36c0-4.424-3.584-8-8-8h-52.36c2.824-4.832 4.36-10.352 4.36-16 0-17.648-14.352-32-32-32s-32 14.352-32 32c0 5.648 1.536 11.168 4.36 16h-52.36c-4.416 0-8 3.576-8 8v36.36c-4.832-2.824-10.352-4.36-16-4.36-17.648 0-32 14.352-32 32s14.352 32 32 32c5.648 0 11.168-1.536 16-4.36v28.36h-136v-232h448v232z"/>
                                        <path
                                            d="m237.66 162.34c-3.128-3.128-8.184-3.128-11.312 0l-32 32 11.312 11.312 18.344-18.344v76.688h16v-76.688l18.344 18.344 11.312-11.312-32-32z"/>
                                        <rect x="224" y="280" width="16" height="16"/>
                                        <rect x="224" y="312" width="16" height="16"/>
                                        <rect x="224" y="344" width="16" height="16"/>
                                        <rect x="48" y="280" width="16" height="16"/>
                                        <rect x="48" y="312" width="16" height="16"/>
                                        <rect x="48" y="344" width="16" height="16"/>
                                        <rect x="48" y="376" width="16" height="16"/>
                                        <rect x="48" y="408" width="16" height="16"/>
                                        <rect x="80" y="408" width="16" height="16"/>
                                        <rect x="112" y="408" width="16" height="16"/>
                                        <rect x="144" y="408" width="16" height="16"/>
                                        <rect x="176" y="408" width="16" height="16"/>
                                    </SVGIcons>
                                </div>
                                <p className="help-block">Define custom fields. You can collect additional
                                    information from your customers by defining custom fields. Each custom field
                                    can also be used as "Add-Ons" to your product / services. For example, if
                                    you define a custom field for number of rooms to be cleaned, you can set an
                                    additional cost that will be charged toward your customer when they select
                                    the number of rooms to be cleaned.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        )
    };
}


class ServiceTemplateForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            newTemplateId: 0,
            success: false,
            imageSuccess: false,
            iconSuccess: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleImageSuccess = this.handleImageSuccess.bind(this);
        this.handleIconSuccess = this.handleIconSuccess.bind(this);
        this.submissionPrep = this.submissionPrep.bind(this);
    }

    handleImageSuccess() {
        this.setState({
            imageSuccess: true
        });
    }

    handleIconSuccess() {
        this.setState({
            iconSuccess: true
        });
    }

    handleResponse(response) {
        this.setState({
            newTemplateId: response.id,
            success: true
        });
        let successMessage = {
            id: Date.now(),
            alertType: 'success',
            message: `${response.name} was saved successfully`,
            show: true,
            autoDismiss: 4000,
        };
        this.props.addAlert(successMessage);
        browserHistory.push(`/manage-catalog/list`);
    }

    submissionPrep(values) {
        //remove id's for duplicate template operation
        if (this.props.params.duplicate) {
            console.log("We have a duplicate and we want to remove id");
            delete values.id;
            values.references.service_template_properties = values.references.service_template_properties.map(prop => {
                if (prop.id) {
                    delete prop.id;
                }
                return prop;
            })
        }
        return values;
    }

    render() {
        //Todo change this. this is how we are currently making sure the redux store is populated
        if (!this.props.company_name) {
            return (<Load/>);
        } else {
            let initialValues = {};
            let initialRequests = [];
            let submissionRequest = {};
            let successMessage = "Template Updated";
            let imageUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/image`;
            let iconUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/icon`;

            if (this.props.params.templateId) {
                initialRequests.push({
                        'method': 'GET',
                        'url': `/api/v1/service-templates/${this.props.params.templateId}`
                    },
                    {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
                );
                if (this.props.params.duplicate) {
                    submissionRequest = {
                        'method': 'POST',
                        'url': `/api/v1/service-templates`
                    };
                    successMessage = "Template Duplicated";
                }
                else {
                    submissionRequest = {
                        'method': 'PUT',
                        'url': `/api/v1/service-templates/${this.props.params.templateId}`
                    };
                    successMessage = "Template Updated";
                    imageUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/image`;
                    iconUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/icon`;
                }
            }
            else {
                initialValues = {
                    type: 'subscription',
                    category_id: 1,
                    trial_period_days: 0,
                    statement_descriptor: this.props.company_name.value.substring(0, 22),
                    interval: 'month',
                    interval_count: 1,
                    published: !!this.props.fieldState.options.stripe_publishable_key,
                    amount: 0
                };
                initialRequests.push(
                    {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
                );
                submissionRequest = {
                    'method': 'POST',
                    'url': `/api/v1/service-templates`
                };
                successMessage = "Template Created";
            }

            return (
                <div>
                    <div className="row">
                        <div className="col-md-3">
                            {(!this.state.imageSuccess || !this.state.iconSuccess || !this.state.success) &&
                            <div>

                                <FileUploadForm
                                    upload={this.state.success}
                                    imageUploadURL={imageUploadURL}
                                    name="template-image"
                                    label="Upload Cover Image"
                                    handleImageUploadSuccess={this.handleImageSuccess}
                                />
                                <FileUploadForm
                                    upload={this.state.success}
                                    imageUploadURL={iconUploadURL}
                                    name="template-icon"
                                    label="Upload Icon Image"
                                    handleImageUploadSuccess={this.handleIconSuccess}
                                />
                            </div>
                            }
                        </div>
                        <div className="col-md-9">
                            <ServiceBotBaseForm
                                form={TemplateForm}
                                formName={TEMPLATE_FORM_NAME}
                                initialValues={initialValues}
                                initialRequests={initialRequests}
                                submissionPrep={this.submissionPrep}
                                submissionRequest={submissionRequest}
                                successMessage={successMessage}
                                handleResponse={this.handleResponse}
                                formProps={{
                                    ...this.props.fieldDispatches,
                                    ...this.props.fieldState
                                }}
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state) {
    return {
        alerts: state.alerts,
        company_name: state.options.company_name,
        fieldState: {
            "options": state.options,
            "serviceTypeValue": selector(state, `type`),
            formJSON: getFormValues(TEMPLATE_FORM_NAME)(state),
        },
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addAlert: (alert) => {
            return dispatch(addAlert(alert))
        },
        dismissAlert: (alert) => {
            return dispatch(dismissAlert(alert))
        },
        fieldDispatches: {
            'setIntervalCount': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `interval_count`, 1))
            },
            'setInterval': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `interval`, 'day'))
            },
            'clearAmount': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `amount`, 0))
            }
        }

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceTemplateForm);