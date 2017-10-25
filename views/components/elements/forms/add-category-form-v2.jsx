import React from 'react';
import ServiceBotBaseForm from './servicebot-base-form.jsx'
import { required} from 'redux-form-validators'
import {Field,} from 'redux-form'
import {inputField} from "./servicebot-base-field.jsx";

function Category(props){
    return (
        <form onSubmit={props.handleSubmit}>
            <Field name="name" type="text" component={inputField} label="Name" validate={required()}/>
            <Field name="description" type="text" component={inputField} label="Description (Optional)"/>
            <div id="service-submission-box" className="button-box right">
                <button  className="btn btn-rounded btn-primary" type="submit">
                    Submit
                </button>
            </div>
        </form>
    )
}

let AddCategoryForm = function(props) {
    let initialRequests = [];
    let submissionRequest = {
        'method': 'POST',
        'url': `/api/v1/service-categories`
    };
    let successMessage = "Category Created";

    if (props.categoryId) {
        initialRequests.push({'method': 'GET', 'url': `/api/v1/service-categories/${props.categoryId}`});

        submissionRequest = {
            'method': 'PUT',
            'url': `/api/v1/service-categories/${props.categoryId}`
        };
        successMessage = "Category Updated";
    }
    else {
        initialRequests.push(
            {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
        );
    }

    return (
            <div className="p-20">
                <ServiceBotBaseForm
                    form = {Category}
                    submissionRequest = {submissionRequest}
                    successMessage = {successMessage}
                    initialRequests = {initialRequests}
                />

            </div>
    );

}

export default AddCategoryForm;
