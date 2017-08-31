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

let ServiceRequestForm = (props) => {
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
            <pre>
                {JSON.stringify(formJSON, null, 2)}
            </pre>

            <div id="service-submission-box" className="button-box right">
                <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go Back</Link>
                <button className="btn btn-rounded btn-primary" type="submit" value="submit">Submit</button>
            </div>
        </form>
    )
};

ServiceRequestForm = connect((state, ownProps) => {
    return {
        "serviceTypeValue" : selector(state, `type`),
        formJSON: getFormValues('servicebotForm')(state),

    }
}, (dispatch, ownProps)=> {
    return {
    }
})(ServiceRequestForm);

class ServiceTemplateForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            newTemplateId : 0,
            success : false,
            imageSuccess : false,
            iconSuccess : false,
            service : this.props.service
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
        let initialValues = this.props.service;
        let initialRequests = [];
        let submissionRequest = {};
        let successMessage = "Service Requested";


        return (

            <div>
                <ServiceBotBaseForm
                    form = {ServiceRequestForm}
                    initialValues = {initialValues}
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