import React from 'react';
import {Link, browserHistory} from 'react-router';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import TagsInput from "react-tagsinput"
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import { Field, Fields,  FormSection,FieldArray, reduxForm, formValueSelector, change, unregisterField } from 'redux-form'
import {connect } from "react-redux";
import { RenderWidget} from "../../utilities/widgets";
let _ = require("lodash");
import ServiceTemplateFormSubscriptionFields from './service-template-form-subscription-fields.jsx';

const CATEGORIES_URL = "/api/v1/service-categories";


const required = value => value ? undefined : 'Required';
const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : undefined;
const maxLength15 = maxLength(15);
const maxLength22 = maxLength(22);

const number = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined;
const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : undefined;
const minValue18 = minValue(18);
const email = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
        'Invalid email address' : undefined;
const tooOld = value =>
    value && value > 65 ? 'You might be too old for this' : undefined;
const aol = value =>
    value && /.+@aol\.com/.test(value) ?
        'Really? You still use AOL for your email?' : undefined



let showResults = (async function(values) {
    await sleep(500); // simulate server latency
    window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
});

const fetchCategories = () =>{
    return new Promise(function(resolve, reject){
        Fetcher(CATEGORIES_URL).then(function (categories_response) {
            if(!categories_response.error){
                console.log(categories_response);
                resolve(categories_response);
            }else{
                console.error("category error", categories_response.error);
                reject(categories_response.error);
            }
        })
    });
};

const componentDidMount = () => {
    var self = this;
    if(this.props.params.templateId && this.props.params.templateId !== null){
        Fetcher(self.state.url).then(function(response){
            if(!response.error){
                self.setState({loading:false, template: response});
            }else{
                self.setState({loading:false});
            }
        }).catch(function(err){
            browserHistory.push("/");
        })
    }else{
        self.setState({loading:false});
    }

    this.replaceTagsInputPlaceholder();
};

const getServiceType = () => {
    let self = this;
    if(this.state.currentAction == "_EDIT"){
        let templateData = self.state.template;
        let interval = templateData.interval;
        let interval_count = templateData.interval_count;

        if (interval == 'day' && interval_count == '1'){
            return ('_ONE_TIME');
        }else if (interval == 'day' && (interval_count == null || interval_count == 'undefined')){
            return ('_CUSTOM');
        }else{
            return ('_SUBSCRIPTION');
        }
    }else{
        return false;
    }
}




let SelectWidget = (props) => {
    let {input, configValue} = props;
    return (<select {...input}>
        <option value=""/>
        { configValue && configValue.map(option =>  <option value={option}>{option}</option>)}
    </select>)
};
const selector = formValueSelector('serviceTemplateForm'); // <-- same as form name

let Text = (props) => {
    return <input {...props.input} type="text"/>
};
let Checkbox = (props) => {
    return <input {...props.input} type="checkbox"/>
};
let Tags = (props) => {
    return  <TagsInput  {...props.input} value={props.input.value || []}/>
};

let CustomInputTypes = {
    "text" : {widget : Text},
    "checkbox" : {widget : Checkbox},
    "select" : {widget : SelectWidget, config : Tags}
};
let CustomField =  (props) => {
    const {index, typeValue, member, hasEmailValue, configValue, myValues, emailValue, change} = props;
    let prop_input_type = "text";
    return (
        <div>
            <div>{JSON.stringify(member)}</div>

            <div>{JSON.stringify(myValues)}</div>
            <Field
                name={`${member}.prop_label`}
                type="text"
                component={renderField}
                label="Label"/>

            <Field name={`${member}.prop_input_type`} id="prop_input_type" component="select">
                <option />
                <option value="text">Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select List</option>
            </Field>

            {typeValue && <RenderWidget
                member={member}
                configValue={props.configValue}
                widgetComponent={CustomInputTypes[typeValue].widget}
                configComponent={CustomInputTypes[typeValue].config}/>}

            <Field
                name={`${member}.private`}
                type="checkbox"
                component={renderField}
                label="Private?"/>

            <Field
                name={`${member}.required`}
                type="checkbox"
                component={renderField}
                label="Required?"/>

            <Field
                name={`${member}.prompt_user`}
                type="checkbox"
                component={renderField}
                label="Prompt User?"/>


        </div>
    )
};

CustomField = connect((state, ownProps) => {
    return {
        "hasEmailValue" : selector(state, "references.service_template_properties")[ownProps.index].hasEmail,
        "typeValue" : selector(state, "references.service_template_properties")[ownProps.index].prop_input_type,
        configValue : selector(state, `references.service_template_properties`)[ownProps.index].config,

        "myValues" : selector(state, `references.${ownProps.member}`)

    }
}, (dispatch, ownProps)=> {
    return {"change" : () => dispatch(change("serviceTemplateForm", `references.${ownProps.member}.email`, ""))}
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
    const { hasEmailValue, fields, meta: { touched, error } } = props;
    console.log("EMAIL ! " , hasEmailValue);
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
const FieldLevelValidationForm = (props) => {
    const { handleSubmit, pristine, reset, submitting } = props
    return (
        <form onSubmit={handleSubmit}>
            <Field name="name" type="text"
                   component={renderField} label="Service Name"
                   validate={[required, maxLength15]}
            />
            <Field name="description" type="text"
                   component={renderField} label="Summary"
                   validate={[required]}
            />
            <Field name="details" type="text"
                   component={renderField} label="Service Details"
                   validate={[required]}
            />
            <Field name="published" type="checkbox"
                   component={renderField} label="Published?"
                   validate={[required]}
            />
            <Field name="category_id" type="select"
                   component={renderField} label="Category"
                   validate={[required]}
            />
            <br/>
            <Field name="statement_descriptor" type="text"
                   component={renderField} label="Statement Descriptor"
                   validate={[required, maxLength22]}
            />
            <Field name="trial_period_days" type="number"
                   component={renderField} label="Trial Period (Days)"
                   validate={[required]}
            />

            <br/>
            <FormSection name="references">
                <FieldArray name="service_template_properties" component={renderCustomProperty}/>
            </FormSection>
            <div>
                <button type="submit" disabled={submitting}>Submit</button>
                <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button>
            </div>
        </form>
    )
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class ServiceForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        const { handleSubmit, pristine, reset, submitting } = this.props
        return (<form onSubmit={handleSubmit}>
            <Field
                name="username"
                type="text"
                component={renderField}
                label="Username"
                validate={[aol, required, length({ min: 2, max: 8 })
                ]}
                warn={email()}
            />
            <button type="submit" disabled={pristine || submitting}>Submit</button>

        </form>)
    }
}

//Put a service template here if testing renter
ServiceForm = reduxForm({
    initialValues : {
        "id": 1,
        "category_id": 1,
        "created_by": 1,
        "name": "great service",
        "description": "its so great",
        "details": "<p>this is the best service</p>",
        "published": true,
        "statement_descriptor": "asdf",
        "trial_period_days": 0,
        "amount": 500,
        "overhead": null,
        "currency": "USD",
        "interval": "month",
        "interval_count": 1,
        "type": "subscription",
        "subscription_prorate": true,
        "created_at": "2017-08-13T14:12:32.130Z",
        "updated_at": "2017-08-13T14:16:21.529Z",
        "references": {
            "service_template_properties": [
                {
                    "id": 1,
                    "name": "some_text",
                    "value": "muhvalue",
                    "prop_class": null,
                    "prop_label": "some text",
                    "prop_description": null,
                    "created_at": "2017-08-13T14:16:21.558Z",
                    "updated_at": "2017-08-13T14:16:21.558Z",
                    "parent_id": 1,
                    "private": false,
                    "prompt_user": true,
                    "required": true,
                    "prop_input_type": "text",
                    "prop_values": null
                },
                {
                    "id": 2,
                    "name": "some_dropdown",
                    "value": "",
                    "prop_class": null,
                    "prop_label": "some dropdown",
                    "prop_description": null,
                    "created_at": "2017-08-13T14:16:21.558Z",
                    "updated_at": "2017-08-13T14:16:21.558Z",
                    "parent_id": 1,
                    "private": false,
                    "prompt_user": true,
                    "required": false,
                    "prop_input_type": "select",
                    "prop_values": null
                },
                {
                    "id": 3,
                    "name": "some_checkbox",
                    "value": true,
                    "prop_class": null,
                    "prop_label": "some checkbox",
                    "prop_description": null,
                    "created_at": "2017-08-13T14:16:21.558Z",
                    "updated_at": "2017-08-13T14:16:21.558Z",
                    "parent_id": 1,
                    "private": false,
                    "prompt_user": true,
                    "required": false,
                    "prop_input_type": "checkbox",
                    "prop_values": null
                }
            ],
            "service_categories": [
                {
                    "id": 1,
                    "name": "great services",
                    "description": null,
                    "created_at": "2017-08-13T14:12:21.065Z",
                    "updated_at": "2017-08-13T14:12:21.065Z"
                }
            ],
            "users": [
                {
                    "id": 1,
                    "role_id": 1,
                    "name": "admin",
                    "email": "kevin@servicebot.io",
                    "status": "active",
                    "customer_id": "cus_BAxGQCOpAQ0bXj",
                    "phone": null,
                    "last_login": "2017-08-13T19:32:05.665Z",
                    "created_at": "2017-08-08T17:19:01.980Z",
                    "updated_at": "2017-08-13T19:32:05.690Z"
                }
            ]
        }
    },
    form: 'serviceTemplateForm'  // a unique identifier for this form
})(FieldLevelValidationForm);






let TestPage = (props) => {
    return <div>
        <ServiceForm onSubmit={showResults} />
    </div>
}

export default TestPage;