import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import { Field, Fields,  FormSection,FieldArray, reduxForm, formValueSelector, change, unregisterField, getFormValues } from 'redux-form'
import {connect } from "react-redux";
import { RenderWidget, WidgetList, widgets, SelectWidget} from "../../utilities/widgets";
import {WysiwygRedux} from "../../elements/wysiwyg.jsx";
import FileUploadForm from "./file-upload-form.jsx";



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


let CustomField =  (props) => {
    const {index, typeValue, member, privateValue, configValue, myValues, changePrivate} = props;
    return (
        <div>
            <Field
                name={`${member}.prop_label`}
                type="text"
                component={renderField}
                label="Label"/>
            <WidgetList name={`${member}.prop_input_type`} id="prop_input_type"/>

            {typeValue && <RenderWidget
                member={member}
                configValue={props.configValue}
                widgetType={typeValue}/>
            }
            <Field
                onChange={changePrivate}
                name={`${member}.private`}
                type="checkbox"
                component={renderField}
                label="Private?"/>

            {!privateValue && <Field
                name={`${member}.required`}
                type="checkbox"
                component={renderField}
                label="Required?"/>
            }
            {!privateValue && <Field
                name={`${member}.prompt_user`}
                type="checkbox"
                component={renderField}
                label="Prompt User?"/>
            }

        </div>
    )
};

CustomField = connect((state, ownProps) => {
    return {
        "privateValue" : selector(state, "references.service_template_properties")[ownProps.index].private,
        "typeValue" : selector(state, "references.service_template_properties")[ownProps.index].prop_input_type,
        "configValue" : selector(state, `references.service_template_properties`)[ownProps.index].config,
        "myValues" : selector(state, `references.${ownProps.member}`)

    }
}, (dispatch, ownProps)=> {
    return {"changePrivate" : () => {
        dispatch(change("serviceTemplateForm", `references.${ownProps.member}.required`, false));
        dispatch(change("serviceTemplateForm", `references.${ownProps.member}.prompt_user`, false));
    }
    }
})(CustomField);

//A single field on the form
const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
    <div>
        <label>{label}</label>
        <div>
            <input {...input} placeholder={label} type={type}/>
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

//Custom property
const renderCustomProperty = (props) => {
    const { privateValue, fields, meta: { touched, error } } = props;
    console.log("EMAIL ! " , privateValue);
    return (
        <ul>
            {fields.map((customProperty, index) =>
                <li key={index}>
                    <button
                        type="button"
                        title="Remove Member"
                        onClick={() => fields.remove(index)}>Remove Member</button>
                    <h4>Member #{index + 1}</h4>
                    <CustomField member={customProperty} index={index}/>
                </li>
            )}
            <li>
                <button type="button" onClick={() => fields.push({})}>Add Member</button>
                {touched && error && <span>{error}</span>}
            </li>
        </ul>
    )}



//The full form

let FieldLevelValidationForm = (props) => {
    const changeServiceType = (event, newValue) => {
        if(newValue === 'one_time') {
            props.setIntervalCount();
            props.setInterval();
        }
        else if(newValue === 'custom') {
            props.setIntervalCount();
            props.setInterval();
            props.clearAmount();
        }
    };

    const { handleSubmit, pristine, reset, submitting, serviceTypeValue, invalid, formJSON, content } = props;
    return (

        <form onSubmit={handleSubmit}>
            <h3>Basic Info</h3>

            <Field name="name" type="text"
                   component={renderField} label="Service Name"
                   validate={[required, maxLength15]}
            />
            <Field name="description" type="text"
                   component={renderField} label="Summary"
                   validate={[required]}
            />
            <Field name="details" type="text"
                   component={WysiwygRedux} label="Service Details"
                   validate={[required]}
            />
            <Field name="published" type="checkbox"
                   component={renderField} label="Published?"
            />
            <Field name="category_id" type="select"
                   component="select" label="Category"
                   validate={[required]}>
                {formJSON._categories && formJSON._categories.map((option, index) =>  <option key={index} value={option.id}>{option.name}</option>)}

            </Field>
            <br/>
            <Field name="statement_descriptor" type="text"
                   component={renderField} label="Statement Descriptor"
                   validate={[required, maxLength22]}
            />
            <Field name="trial_period_days" type="number"
                   component={renderField} label="Trial Period (Days)"
            />

            <label htmlFor="type">Service Type</label><br></br>
            <Field name="type" id="type" component="select" onChange={changeServiceType}>
                <option value="subscription">Subscription</option>
                <option value="one_time">One Time</option>
                <option value="custom">Custom</option>
            </Field>

            {(serviceTypeValue ==='subscription' || serviceTypeValue ==='one_time') &&
                <Field name="amount" type="number"
                       component={renderField} label="Amount"
                />
            }

            {(serviceTypeValue ==='subscription') &&
                <div>
                    <label htmlFor="type">Bill Customer Every</label>
                    <Field name="interval_count" type="number"
                    component={renderField}
                    />
                    <Field name="interval" id="interval" component="select">
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </Field>
                </div>
            }

            {(serviceTypeValue ==='custom') && <div>You will be able to add custom service charges after an instance of this service as been created for a customer.</div>
            }

            <br/>
            <FormSection name="references">
                <FieldArray name="service_template_properties" component={renderCustomProperty}/>
            </FormSection>
            <div id="service-submission-box" className="button-box right">
                <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go Back</Link>
                <button className="btn btn-rounded btn-primary" type="submit" value="submit">Submit</button>
            </div>
        </form>
    )
};

FieldLevelValidationForm = connect((state, ownProps) => {
    return {
        "serviceTypeValue" : selector(state, `type`),
        formJSON: getFormValues('servicebotForm')(state),

    }
}, (dispatch, ownProps)=> {
    return {
        'setIntervalCount' : () => {dispatch(change("serviceTemplateForm", `interval_count`, 1))},
        'setInterval' : () => {dispatch(change("serviceTemplateForm", `interval`, 'day'))},
        'clearAmount' : () => {dispatch(change("serviceTemplateForm", `amount`, 0))}
    }
})(FieldLevelValidationForm);

class ServiceTemplateForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            newTemplateId : 0,
            success : false,
            imageSuccess : false,
            iconSuccess : false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleImageSuccess = this.handleImageSuccess.bind(this);
        this.handleIconSuccess = this.handleIconSuccess.bind(this);

    }

    handleImageSuccess(){
        this.setState({
            imageSuccess: true
        });
    }
    handleIconSuccess(){
        this.setState({
            iconSuccess: true
        });
    }

    handleResponse(response){
        this.setState({
            newTemplateId : response.id,
            success: true
        });
    }
    render () {
        let initialRequests = [];
        let submissionRequest = {};
        let successMessage = "Template Updated";
        let imageUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/image`;
        let iconUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/icon`;

        if(this.props.params.templateId){
            initialRequests.push({'method': 'GET', 'url': `/api/v1/service-templates/${this.props.params.templateId}`},
                {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
            );
            if(this.props.params.duplicate){
                submissionRequest = {
                    'method': 'POST',
                    'url': `/api/v1/service-templates`
                };
                successMessage = "Template Duplicated";
            }
            else{
                submissionRequest = {
                    'method': 'PUT',
                    'url': `/api/v1/service-templates/${this.props.params.templateId}`
                };
                successMessage = "Template Updated";
                imageUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/image`;
                iconUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/icon`;

            }
        }
        else{
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
                {(!this.state.imageSuccess ||
                    !this.state.iconSuccess ||
                    !this.state.success) &&
                    <div>

                        <FileUploadForm
                            upload = {this.state.success}
                            imageUploadURL = {imageUploadURL}
                            name = "template-image"
                            label = "Upload Cover Image"
                            handleImageUploadSuccess = {this.handleImageSuccess}
                        />
                        <FileUploadForm
                            upload = {this.state.success}
                            imageUploadURL = {iconUploadURL}
                            name = "template-icon"
                            label = "Upload Icon Image"
                            handleImageUploadSuccess = {this.handleIconSuccess}
                        />
                    </div>
                }

                <ServiceBotBaseForm
                    form = {FieldLevelValidationForm}
                    initialRequests = {initialRequests}
                    submissionRequest = {submissionRequest}
                    successMessage = {successMessage}
                    handleResponse = {this.handleResponse}
                />
            </div>
        )

    }
}


export default ServiceTemplateForm;