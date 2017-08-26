import React from 'react';
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import { Field, Fields,  FormSection,FieldArray, reduxForm, formValueSelector, change, unregisterField, getFormValues } from 'redux-form';
import {connect } from "react-redux";
import {Link, browserHistory} from 'react-router';


const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
    <div>
        <label>{label}</label>
        <div>
            <input {...input} placeholder={label} type={type}/>
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

let testForm = (props) => {
    const { handleSubmit, pristine, reset, submitting, formJSON } = props;
    return (

        <form onSubmit={handleSubmit}>
            <Field name="name" type="text"
                   component={renderField} label="Category Name"
            />
            <Field name="description" type="text"
                   component={renderField} label="Description"
            />
            <div id="service-submission-box" className="button-box right">
                <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go Back</Link>
                <button className="btn btn-rounded btn-primary" type="submit" value="submit">Submit</button>
            </div>
        </form>
    )
};

testForm = connect((state, ownProps) => {
    return {
        formJSON: getFormValues('servicebotForm')(state),
    }
}, (dispatch, ownProps)=> {
    return {}
})(testForm);

class TestBase extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        let initialRequests = [];
        let submissionRequest = {};
        let successMessage = "Category Updated";
        if(this.props.params.templateId){
            initialRequests.push({'method': 'GET', 'url': `/api/v1/service-categories/${this.props.params.templateId}`})
            submissionRequest = {
                'method': 'PUT',
                'url': `/api/v1/service-categories/${this.props.params.templateId}`
            };
            successMessage = "Category Created";
        }
        else{
            submissionRequest = {
                'method': 'POST',
                'url': `/api/v1/service-categories`
            };
        }

        return (
            <div>
                <ServiceBotBaseForm
                    form = {testForm}
                    initialRequests = {initialRequests}
                    submissionRequest = {submissionRequest}
                    successMessage = {successMessage}
                    failureRoute = "/login"
                />
            </div>
        )

    }
}

export default TestBase;
