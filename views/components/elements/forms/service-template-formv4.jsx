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
    getFormValues
} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, PriceBreakdown, widgets} from "../../utilities/widgets";
import {WysiwygRedux} from "../../elements/wysiwyg.jsx";
import FileUploadForm from "./file-upload-form.jsx";
import {inputField, selectField, priceField} from "./servicebot-base-field.jsx";
import ServiceBotBaseForm from "./servicebot-base-form.jsx";


const required = value => value ? undefined : 'Required';
const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : undefined;
const maxLength15 = maxLength(15);
const maxLength22 = maxLength(22);
const number = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined;
const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : undefined;
const minValue18 = minValue(18);


const selector = formValueSelector('servicebotForm'); // <-- same as form name


class CustomField extends React.Component {

    constructor(props){
        super(props);
    }


    render() {

        let props = this.props;

        const {index, typeValue, member, privateValue, configValue, myValues, changePrivate} = props;
        return (
            <div>
                <Field
                    name={`${member}.prop_label`}
                    type="text"
                    component={inputField}
                    label="Label"/>

                <WidgetList name={`${member}.type`} id="type"/>

                {typeValue && <RenderWidget
                    member={member}
                    configValue={configValue}
                    widgetType={typeValue}/>
                }
                <Field
                    onChange={changePrivate}
                    name={`${member}.private`}
                    type="checkbox"
                    component={inputField}
                    label="Private?"/>

                {!privateValue && <Field
                    name={`${member}.required`}
                    type="checkbox"
                    component={inputField}
                    label="Required?"/>
                }
                {!privateValue && <Field
                    name={`${member}.prompt_user`}
                    type="checkbox"
                    component={inputField}
                    label="Prompt User?"/>
                }

            </div>
        )
    };
}

CustomField = connect((state, ownProps) => {
    return {
        "privateValue": selector(state, "references.service_template_properties")[ownProps.index].private,
        "typeValue": selector(state, "references.service_template_properties")[ownProps.index].type,
        "configValue": selector(state, `references.service_template_properties`)[ownProps.index].config,
        "myValues": selector(state, `references.${ownProps.member}`)

    }
}, (dispatch, ownProps) => {
    return {
        "changePrivate": () => {
            dispatch(change("serviceTemplateForm", `references.${ownProps.member}.required`, false));
            dispatch(change("serviceTemplateForm", `references.${ownProps.member}.prompt_user`, false));
        }
    }
})(CustomField);

//A single field on the form


//Custom property
class renderCustomProperty extends React.Component {

    constructor(props){
        super(props);

        console.log("render custom props", props);
    }

    render(){
        let props = this.props;
        const {privateValue, fields, meta: {touched, error}} = props;
        console.log("EMAIL ! ", privateValue);
        return (
            <ul className="custom-fields-list">
                {fields.map((customProperty, index) =>
                    <li className="custom-field-item" key={index}>
                        <div className="custom-field-name">
                            <h4>Field #{index + 1}</h4>
                            <button className="btn btn-rounded custom-field-button"
                                    type="button"
                                    title="Remove Field"
                                    onClick={() => fields.remove(index)}>Remove
                            </button>
                        </div>
                        <CustomField member={customProperty} index={index}/>
                    </li>
                )}
                <li>
                    <button className="btn btn-rounded" type="button" onClick={() => fields.push({})}>Add Field</button>
                    {touched && error && <span>{error}</span>}
                </li>
            </ul>
        )
    };
}


//The full form



class FieldLevelValidationForm extends React.Component {

    constructor(props){
        super(props);

    }
    render() {

        let props = this.props;

        const changeServiceType = (event, newValue) => {
            if (newValue === 'one_time') {
                props.setIntervalCount();
                props.setInterval();
            }
            else if (newValue === 'custom') {
                props.setIntervalCount();
                props.setInterval();
                props.clearAmount();
            }
        };


        const {handleSubmit, pristine, reset, submitting, serviceTypeValue, invalid, formJSON} = props;

        const sectionDescriptionStyle = {
            background: "#7fd3ff",
            height: "100px",
            width: "100px",
            padding: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
        };

        return (
            <div>
                {/*<div className="col-md-3">*/}
                {/*Tabs*/}
                {/*<pre className="" style={{maxHeight: '300px', overflowY: 'scroll'}}>*/}
                {/*{JSON.stringify(formJSON, null, 2)}*/}
                {/*</pre>*/}
                {/*</div>*/}
                <div className="col-md-12">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-8">
                                <h3>Basic Info</h3>
                                <Field name="name" type="text"
                                       component={inputField} label="Product / Service Name"
                                       validate={[required, maxLength15]}
                                />
                                <Field name="description" type="text"
                                       component={inputField} label="Summary"
                                       validate={[required]}
                                />
                                <Field name="details" type="text"
                                       component={WysiwygRedux} label="Details"
                                       validate={[required]}
                                />
                                <Field name="published" type="checkbox"
                                       component={inputField} label="Published?"
                                />
                                <Field name="category_id" type="select"
                                       component={selectField} label="Category" options={formJSON._categories}
                                       validate={[required]}
                                />
                            </div>
                            <div className="col-md-4">
                                <div style={sectionDescriptionStyle}>
                                    <img src="/assets/custom_icons/all_services_page_heading_icon.png"/>
                                </div>
                                <p className="help-block">Enter the basic information about your service. Summary will
                                    be
                                    shown to users in the product / service listing pages, such as the home page
                                    featured
                                    items. Details will be shown on each individual products / services page.</p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <hr/>
                                <div className="row">
                                    <div className="col-md-8">
                                        <h3>Payment Details</h3>
                                        <Field name="statement_descriptor" type="text"
                                               component={inputField} label="Statement Descriptor"
                                               validate={[required, maxLength22]}
                                        />
                                        <Field name="trial_period_days" type="number"
                                               component={inputField} label="Trial Period (Days)"
                                        />
                                        <Field name="type" id="type"
                                               component={selectField} label="Billing Type" onChange={changeServiceType}
                                               options={[
                                                   {id: "subscription", name: "Subscription"},
                                                   {id: "one_time", name: "One Time"},
                                                   {id: "custom", name: "Custom"},
                                               ]}
                                        />
                                        {(serviceTypeValue === 'subscription' || serviceTypeValue === 'one_time') &&
                                        <Field name="amount" type="number"
                                               component={priceField} label="Amount"/>
                                        }

                                        {(serviceTypeValue === 'subscription') &&
                                        <div className="form-group form-group-flex">
                                            <label className="control-label form-label-flex-md" htmlFor="type">Bill
                                                Customer Every</label>
                                            <Field name="interval_count" type="number"
                                                   component={inputField}
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
                                        }

                                        {(serviceTypeValue === 'custom') &&
                                        <div>
                                            <p>You will be able to add custom service charges after an instance of
                                                this service as been created for a customer.
                                            </p>
                                        </div>
                                        }
                                    </div>
                                    <div className="col-md-4">
                                        <div style={sectionDescriptionStyle}>
                                            <img src="/assets/custom_icons/all_services_page_heading_icon.png"/>
                                        </div>
                                        <p className="help-block">Setup payment details. This will be how your customers
                                            will be charged. For example, you can setup a recurring charge for your
                                            product
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
                                                        component={renderCustomProperty}/>
                                        </FormSection>
                                        {props.formJSON.references && props.formJSON.references.service_template_properties &&
                                        <PriceBreakdown
                                            inputs={props.formJSON.references.service_template_properties}/>}
                                        <div id="service-submission-box" className="button-box right">
                                            <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go
                                                Back</Link>
                                            <button className="btn btn-rounded btn-primary" type="submit"
                                                    value="submit">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div style={sectionDescriptionStyle}>
                                            <img src="/assets/custom_icons/all_services_page_heading_icon.png"/>
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
                </div>
            </div>
        )
    };
}

FieldLevelValidationForm = connect((state, ownProps) => {
    return {
        "serviceTypeValue": selector(state, `type`),
        formJSON: getFormValues('servicebotForm')(state),

    }
}, (dispatch, ownProps) => {
    return {
        'setIntervalCount': () => {
            dispatch(change("serviceTemplateForm", `interval_count`, 1))
        },
        'setInterval': () => {
            dispatch(change("serviceTemplateForm", `interval`, 'day'))
        },
        'clearAmount': () => {
            dispatch(change("serviceTemplateForm", `amount`, 0))
        }
    }
})(FieldLevelValidationForm);

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
    }

    render() {
        let initialValues = {};
        let initialRequests = [];
        let submissionRequest = {};
        let successMessage = "Template Updated";
        let imageUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/image`;
        let iconUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/icon`;

        if (this.props.params.templateId) {
            initialRequests.push({'method': 'GET', 'url': `/api/v1/service-templates/${this.props.params.templateId}`},
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
                category_id: 1
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
                            form={FieldLevelValidationForm}
                            initialValues={initialValues}
                            initialRequests={initialRequests}
                            submissionRequest={submissionRequest}
                            successMessage={successMessage}
                            handleResponse={this.handleResponse}
                        />
                    </div>
                </div>
            </div>
        )

    }
}


export default ServiceTemplateForm;