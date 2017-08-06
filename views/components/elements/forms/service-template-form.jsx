import React from 'react';
import {Link, browserHistory} from 'react-router';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import TagsInput from "react-tagsinput"
import Inputs from "../../utilities/inputs.jsx";
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import DataFromReview from "./service-template-form-review.jsx";
import {Wysiwyg} from "../../elements/wysiwyg.jsx";
import ServiceTemplateFormSubscriptionFields from './service-template-form-subscription-fields.jsx';
import Buttons from "../../elements/buttons.jsx";
import ModalAddCategory from "../modals/modal-add-category.jsx";
import ImageUploader from "../../utilities/image-uploader.jsx";
let _ = require("lodash");
/**
 * TO DO FOR VALIDATION HANDLING:
 *
 * 1. Define a validation object which will be added as a property to a dataform formatted:
 *      {
 *      "fieldname" : validationFunction,
 *      "fieldname2" :validationFunction,
 *      ...
 *      ...
 *      "references" : {
 *          "modelName1" : {
 *              "fieldname3" : validationFunction,
 *              ...
 *          }
 *      }
 *
 * 2. In the dataform submit function, look through each field and run the validation function, the function should either
 *    return true, false, or an error string
 *
 * 3. if anything returns false or error string do not continue with submission of form - instead build a
 *    new state wi where each validation error should be included in the object that contains the error (either top level or inside a model object)
 *    and the error text should be displayed as a mouse over tooltip or something... the validation function cal also call Alert to display information at the bottom of screen
 *
 * 4. When the state change is initiated, each datachild will be given an error object if it contains any fields that contain errors in it's props
 *
 * 5. when the datachild's rendering it's components we will check the name of each component and if the field's name matches the error object it will do something to the component
 *    (either pass a prop or class or something) and make sure if it's not a standard input have the component handle the data it is receiving.
 *
 * 6. when the bad fields are fixed, submit again and run validators again, this process will repeat if errors are detected again, otherwise form should continue with submission process.
 *
 */
class ServiceTemplateForm extends React.Component {

    constructor(props) {
        super(props);
        // if editing an existing template (meaning with and ID)
        if(this.props.params.templateId && this.props.params.templateId !== null ){
            // console.log("has templateId", this.props.params.templateId);
            this.state = {
                templateId: this.props.params.templateId,
                template: [],
                url: "/api/v1/service-templates/" + props.params.templateId,
                loading: true,
                submitSuccessful: false,
                submissionResponse: false,
                files: [],
                customPropsCount: 0,
                newProperties: [],
                categories_url: "/api/v1/service-categories",
                templateImageURL: `/api/v1/service-templates/${this.props.params.templateId}/image`,
                categories: [],
                currentAction: '_EDIT',
                uploadTrigger: false
            };
        }else{ // else creating a new template (meaning without an ID)
            // console.log("no templateId");
            this.state = {
                template: {},
                loading:true,
                submitSuccessful: false,
                submissionResponse: false,
                customPropsCount: 0,
                newProperties: [],
                templateImageURL: '/assets/custom_icons/upload.png',
                categories_url: "/api/v1/service-categories",
                categories: [],
                files: [],
                customPropsToRemove: [],
                currentAction: '_CREATE',
                addCategoryModal: false,
                uploadTrigger: false
            };
        }
        this.fetchCategories = this.fetchCategories.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.handleAddProp = this.handleAddProp.bind(this);
        this.handleDeleteProp = this.handleDeleteProp.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.processForm = this.processForm.bind(this);
        this.inputTypesFilter = this.inputTypesFilter.bind(this);
        this.advanceOptionsFilter = this.advanceOptionsFilter.bind(this);
        this.getFormData = this.getFormData.bind(this);
        this.getServiceType = this.getServiceType.bind(this);
        this.openAddCategoryModal = this.openAddCategoryModal.bind(this);
        this.closeAddCategoryModal = this.closeAddCategoryModal.bind(this);
        this.onImageChanged = this.onImageChanged.bind(this);
        this.handleImageUploadSuccess = this.handleImageUploadSuccess.bind(this);
    }

    componentWillMount(){
        let self = this;

        this.fetchCategories();
    }

    fetchCategories(){
        let self = this;

        return new Promise(function(resolve, reject){
            Fetcher(self.state.categories_url).then(function (categories_response) {
                if(!categories_response.error){
                    // console.log(categories_response);
                    self.setState({categories: categories_response}, function(){
                        resolve(categories_response);
                    });
                }else{
                    console.error("category error", categories_response.error);
                    reject(categories_response.error);
                }
            })
        });
    }



    componentDidMount() {
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
    }

    replaceTagsInputPlaceholder(){
        let tagsinputs = document.getElementsByClassName('react-tagsinput-input');
        // console.log('gettnig tags inputs', tagsinputs);
        if(tagsinputs && tagsinputs.length){
            tagsinputs[0].placeholder = 'Add Values';
        }
    }

    componentDidUpdate(prevProps, prevState){
        // console.log("Updated new state:", this.state);
        this.replaceTagsInputPlaceholder();

        //find the input with error and scroll to it
        let errorInputs = document.getElementsByClassName('has-error');
        if(errorInputs.length){
            let y = errorInputs[0].offsetTop;
            window.scrollTo(0, y);
        }

        if(prevState.submissionResponse.id != this.state.submissionResponse.id){
            console.log("previous state", prevState.submissionResponse);
            console.log("submission was successful", this.state.submissionResponse);
            this.setState({uploadTrigger:true});
        }
    }

    handleImageUploadSuccess(){
        if(!this.state.submitSuccessful) {
            this.setState({submitSuccessful: true});
        }
    }

    handleResponse(response){
        let self = this;
        console.log("state inside handle response", self.state);
        if(_.has(self.state, 'customPropsToRemove') && self.state.customPropsToRemove.length > 0){
            console.log("has something to delete", self.state.customPropsToRemove);
            _.map(self.state.customPropsToRemove, function(id){
                Fetcher(`/api/v1/service-template-properties/${id}`, 'delete').then(function (response) {
                    if(response.error){
                        console.error("problem encountered during deletion of service template properties with id: " + id);
                    }
                })
            })
        }
        if(!response.error){
            if(!this.state.imageChanged) {
                self.setState({submissionResponse: response, submitSuccessful: true});
            }else{
                self.setState({submissionResponse: response});
            }
        }else{
            console.log('has errors in handle response', response);
        }
    }

    handleAddProp(e){
        e.preventDefault();
        this.setState({ customPropsCount: this.state.customPropsCount + 1,
            newProperties : this.state.newProperties.concat({objectName:"newProp" + this.state.customPropsCount})});
    }
    handleDeleteProp(objectName){
        let self = this;
        return function(e) {
            e.preventDefault();
            self.setState({newProperties : self.state.newProperties.filter(function(prop){
                return prop.objectName != objectName;
            })});
        }
    }
    handleDeleteOriginalProp(id){
        let self = this;
        return function(e) {
            e.preventDefault();
            let arrayOfProps = self.state.template.references.service_template_properties;
            let newArrayOfProps = [];
            let newTemplate = self.state.template;
            _.map(arrayOfProps, function(prop){
               if(prop.id != id){
                   newArrayOfProps = _.concat(newArrayOfProps, prop);
               }
            });
            self.setState({ template : _.set(newTemplate, 'references.service_template_properties', newArrayOfProps),
                            customPropsToRemove: _.concat(self.state.customPropsToRemove, id)});
        }
    }
    //This is for the input type selection for the custom fields
    inputTypesFilter(parentValue){
        return function(child){
            if(child.type && child.props.isTags && parentValue == 'select'){
                return true;
            }else if(child.type && child.props.type == 'select' && child.props.name == 'value' && parentValue == 'select') {
                return true;
            }else if(child.type && child.props.type == 'text' && child.props.name == 'value' && parentValue == 'text'){
                return true;
            }else if(child.type && child.props.type == 'checkbox' && parentValue == 'checkbox'){
                return true;
            }else{
                return false;
            }
        }
    }
    //This is for the section with Private, required and prompt user.
    advanceOptionsFilter(parentValue){
        return function(child){
            if(parentValue == 'false'){
                if(child.props.name == 'required' || child.props.name == 'prompt_user' || child.props.name == "prompt_user2" ){
                    //return true to render the child, false to skip rendering the currrent child.
                    return true;
                }
            }
        }
    }

    //This a a helper function to access data in this.state.form
    getFormData(data, path){
        let myData = null;
        if(data && path){
            myData =_.get(data, path);
            if(_.has(myData, 'prop_values')){
                return myData.prop_values;
            }
        }
        return false;
    }

    onImageChanged(){
        this.setState({imageChanged: true});
    }

    onUpdate(form){
        //getting the form JSON string from DataForm on update
        this.setState({form: form});
    }

    getServiceType(){
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

    openAddCategoryModal(){
        this.setState({addCategoryModal: true});
    }
    closeAddCategoryModal(){
        let self = this;
        this.fetchCategories().then(function (fetchResponse) {
            self.setState({addCategoryModal: false});
        }, function (fetchError) {
            console.log('fetch new categories error', fetchError);
        });
    }

    processForm(id = null){
        let self = this;
        let reviewJSON, categories, templateData = null;
        let formData = false;
        let templateDataChild = [];
        let submissionURL = "/api/v1/service-templates";
        let submission_method = "POST";
        if(id){
            templateData = self.state.template;
            templateDataChild = self.state.template.references.service_template_properties;
            if(!self.props.params.duplicate) {
                submissionURL = submissionURL + '/' + id;
                submission_method = "PUT";
            }else{
                templateDataChild.map(child => {
                    return child;
                })
            }
        }
        if(this.state.form) {
            reviewJSON = self.state.form;

            //save the data for later use in the form
            formData = JSON.parse(self.state.form);
        }
        if(this.state.categories && this.state.categories.length > 0 ){
            categories = self.state.categories;
        }

        //Defining general validators
        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateStringNoSpace   = (val) => { return typeof(val) == 'string' && val.indexOf(' ') == -1};
        let validateEmptyString     = (val) => { return val.trim() != ''};
        let validateNumber          = (val) => { return !isNaN(parseFloat(val)) && isFinite(val) };
        let validateBoolean         = (val) => { return val === true || val === false || val === 'true' || val === 'false'};
        //Defining validators
        let validateName            = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"Field name is required."}};
        let validateDescription     = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"field description is required"}};
        let validatePublished       = (val) => { return validateBoolean(val) || {error:"Field published must be a boolean"}};
        let validateCategory        = (val) => { return (validateRequired(val) && validateNumber(val)) || {error:"Field category must be a valid ID"}};
        let validateTrialDay        = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field trial days is required and must be a number greater than or equal 0"}};
        let validateAmount          = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 0) || {error:"Field amount is required and must be a number greater than or equal 0"}};
        let validateCurrency        = (val) => { return (validateRequired(val) && val === 'USD')};
        let validateInterval        = (val) => { return (validateRequired(val) && (val == 'day' || val == 'week' || val == 'month' || val == 'year')) || {error:"Field interval must be day, week, month or year."}};
        // let validateIntervalCount   = (val) => { return (validateRequired(val) && validateNumber(val) && val >= 1) || {error:"Field interval count is required and must be a number greater than 0"}};
        let validateIntervalCount   = () => { return (true) };
        let validateProrated        = (val) => { return (validateRequired(val) && validateBoolean(val)) || {error: "Field prorated is required and must be boolean."}};
        //Defining DataChild validators
        let validateCustomPropName          = (val) => { return (validateRequired(val) && validateEmptyString(val)) || {error: "Field label is required."}};
        // let validateCustomPropMachineName   = (val) => { return (validateRequired(val) && validateStringNoSpace(val) && validateEmptyString(val)) || {error: "Field machine name is required and must not have any space, use _ instead."}};
        let validateCustomPropInputType     = (val) => { return (validateRequired(val) && (val == "text" || val == "select" || val == "checkbox")) || {error: "Field input type is required and must be text, select or checkbox"}};
        let validateCustomPropPrivate       = (val) => { return (validateRequired(val) && validateBoolean(val)) || {error: "Field private is required and must be boolean."}};
        let validateCustomPropRequired      = (val) => { return (validateRequired(val) && validateBoolean(val)) || {error: "Field required is required and must be boolean."}};
        let validateCustomPropPromptUser    = (val) => { return (validateRequired(val) && validateBoolean(val)) || {error: "Field prompt user is required and must be boolean."}};
        //Setting up an validator object that will be passed into DataFrom through props, object key must match a form input name.
        let validators = {
            'name'              : validateName,
            'description'       : validateDescription,
            'published'         : validatePublished,
            'category_id'       : validateCategory,
            'trial_period_days' : validateTrialDay,
            'amount'            : validateAmount,
            'currency'          : validateCurrency,
            'interval'          : validateInterval,
            'interval_count'    : validateIntervalCount,
            'subscription_prorate': validateProrated,
            'references'        : {
                service_template_properties :{
                    'prop_label'        : validateCustomPropName,
                    // 'name'              : validateCustomPropMachineName,
                    'prop_input_type'   : validateCustomPropInputType,
                    'private'           : validateCustomPropPrivate,
                    'required'          : validateCustomPropRequired,
                    'prompt_user'       : validateCustomPropPromptUser
                }
            }
        };

        let imageUploadURL = (this.state.templateId && !this.props.params.duplicate) ?
            `/api/v1/service-templates/${this.state.templateId}/image` :
            `/api/v1/service-templates/${this.state.submissionResponse.id}/image`;

        let iconUploadURL = (this.state.templateId && !this.props.params.duplicate) ?
            `/api/v1/service-templates/${this.state.templateId}/icon` :
            `/api/v1/service-templates/${this.state.submissionResponse.id}/icon`;

        console.log("template image urls", imageUploadURL, iconUploadURL);
        //Returning stuff to be rendered (the input fields)
        return (
            <div>
                <DataForm validators={validators} onUpdate={self.onUpdate} handleResponse={self.handleResponse} url={submissionURL} method={submission_method}>
                    <div className="row">
                        <div className="col-sm-12 col-md-4">
                            <div id="service-basic-info" className="p-20">
                                <h3>Basic Info</h3>

                                <div className="form-group form-group-flex column">
                                    <label>Upload Cover Image</label>
                                    <ImageUploader elementID="template-image" imageStyle="template-image-upload"
                                                   imageURL={`/api/v1/service-templates/${this.state.submissionResponse.id}/image`}
                                                   imageGETURL={imageUploadURL}
                                                   uploadTrigger={this.state.uploadTrigger}
                                                   uploadButton={false}
                                                   handleSuccess={this.handleImageUploadSuccess}
                                                   onChange={this.onImageChanged}
                                                   imageRemovable={true}
                                                   name="template-image"/>
                                </div>

                                <div className="form-group form-group-flex column">
                                    <label>Upload Icon</label>
                                    <ImageUploader elementID="template-icon" imageStyle="template-image-upload"
                                                   imageURL={`/api/v1/service-templates/${this.state.submissionResponse.id}/icon`}
                                                   imageGETURL={iconUploadURL}
                                                   uploadTrigger={this.state.uploadTrigger}
                                                   uploadButton={false}
                                                   handleSuccess={this.handleImageUploadSuccess}
                                                   onChange={this.onImageChanged}
                                                   imageRemovable={true}
                                                   name="template-icon"/>
                                </div>

                                <Inputs type="text" name="name" label="Service Name" defaultValue={templateData && templateData.name}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <Inputs type="text" name="description" label="Summary" defaultValue={templateData && templateData.description}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <div className="form-group">
                                    <label className="control-label">Service Details</label>
                                    <Wysiwyg name="details" value={templateData && templateData.details} ref="wysiwyg"
                                             onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                </div>

                                <Inputs type={'select'} name="published" label="Published?" defaultValue={true}
                                        options={[{'Yes':true},{'No':false}]}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <div className="form-group">
                                    <label className="">Category</label>
                                    <div className="form-group-flex">
                                        <select id="category_id" className="form-control" defaultValue={templateData ? templateData.category_id : 1} name="category_id" onChange={this.props.onChange}>
                                            {categories && categories.map(cat => (
                                                <option key={`category-${cat.id}`} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <Buttons buttonClass="btn btn-flat btn-info" btnType="link" text="Add" onClick={this.openAddCategoryModal}/>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4">
                            <div id="service-payment-info" className="p-20">
                                <h3>Payment Info</h3>

                                <Inputs type="text" maxLength="22" name="statement_descriptor" label="Statement Descriptor" defaultValue={templateData && templateData.statement_descriptor}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <Inputs type="number" name="trial_period_days" label="Trial Period (Days)" defaultValue={templateData ? templateData.trial_period_days : 0}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <Inputs type="hidden" name="currency" label="Currency" defaultValue={(templateData && templateData.currency) ? templateData.currency : "USD"}
                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                <ServiceTemplateFormSubscriptionFields form={formData} templateData={templateData} serviceType={this.getServiceType()} formAction={self.state.currentAction}
                                                                       onChange={function(){}} receiveOnChange={true} receiveValue={true} />

                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4">
                            <div id="service-custom-props" className="p-20">
                                <h3>Custom Fields</h3>
                                <p className="help-block">You can add custom fields for collecting additional information from customers.</p>
                                {/* This is loading original DataChild data for Editing or Copying */}
                                {templateDataChild.map(function(prop){

                                    let defaultValue = null;
                                    if(prop.prop_input_type == "text"){
                                        defaultValue = (
                                            <Inputs type="text" name="value" label="Default Value" defaultValue={prop.value}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                        );
                                    }else if(prop.prop_input_type == "select"){
                                        defaultValue = (
                                            <Inputs type={'select'} name="value" label="Default Value" defaultValue={prop.value ? prop.value : null}
                                                    options={prop.prop_values}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true} />
                                        );
                                    }
                                    else if(prop.prop_input_type == "checkbox"){
                                        defaultValue = (
                                            <Inputs type="checkbox" name="value" label="Default Value" defaultValue={prop.value == "true"}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                        );
                                    }

                                    let defaultOptions = null;
                                    if(prop.prop_input_type == "select"){
                                        console.log("IN SELECT!");
                                        defaultOptions = (
                                            <div>
                                                <label>Available Values</label>
                                                <TagsInput onlyUnique={true} name="prop_values" value={prop.prop_values ? prop.prop_values : []}
                                                           isTags={true} onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                            </div>);
                                    }else{
                                        console.log("propblem getting the default options", prop);
                                    }

                                    return (
                                        <DataChild key={prop.name} modelName="service_template_properties" objectName={prop.name}>
                                            <h3>Custom Properties</h3>

                                            <div className="button-box space-between">
                                                <div><strong>{prop.prop_label}</strong></div>
                                                <button className="btn btn-flat btn-info" onClick={self.handleDeleteOriginalProp(prop.id)}>Remove</button>
                                            </div>

                                            {!self.props.params.duplicate && <Inputs type="hidden" name="id" defaultValue={prop.id}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>}

                                            <CustomPropNameField name="prop_label" objectName={prop.name} defaultValues={{label: prop.prop_label, name: prop.name}}
                                                                 onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                            <Inputs type={'select'} disabled name="prop_input_type" label="Input Type" defaultValue={prop.prop_input_type ? prop.prop_input_type : 'text'}
                                                    options={[{'Text Box':'text'},{'Select List':'select'},{'Check Box':'checkbox'}]} filter={self.inputTypesFilter}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true} />

                                            {defaultOptions}
                                            {defaultValue}

                                            <Inputs type="select" name="private" label="Private?" defaultValue={prop.private ? prop.private : false}
                                                    options={[{'Yes': true}, {'No': false}]} filter={self.advanceOptionsFilter}
                                                    manageDependency={[{name: "prompt_user", dependsOn: "required", valFun : function(value, child){
                                                        child.props.onChange((value != "false").toString());
                                                    }
                                                    }]}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}>

                                                <Inputs type="select" name="required" label="Required?" unmountValue={false} defaultValue={prop.required}
                                                        options={[{'Yes': true}, {'No': false}]}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="select" name="prompt_user" label="Prompt User" unmountValue={false} defaultValue={prop.prompt_user}
                                                        options={[{'Yes': true}, {'No': false}]}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                            </Inputs>

                                        </DataChild>
                                    );
                                })}

                                {/* Rendering new prop fields */}
                                {this.state.newProperties.map(function(prop){
                                    return (
                                        <DataChild key={prop.objectName} modelName="service_template_properties" objectName={prop.objectName}>

                                            <div className="button-box space-between">
                                                <div><strong>{`New Custom Field`}</strong></div>
                                                <button className="btn btn-flat btn-info" onClick={self.handleDeleteProp(prop.objectName)}>Remove</button>
                                            </div>

                                            <CustomPropNameField name="prop_label" objectName={prop.objectName}
                                                                 onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                            <Inputs type={'select'} name="prop_input_type" label="Input Type" defaultValue={'text'}
                                                    options={[{'Text Box':'text'},{'Select List':'select'},{'Check Box':'checkbox'}]} filter={self.inputTypesFilter}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true} >

                                                <TagsInput onlyUnique={true} name="prop_values" value={[]}
                                                           isTags={true} onChange={function(){}} receiveOnChange={true} receiveValue={true}/>


                                                <Inputs type="text" name="value" label="Default Value" defaultValue=""
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="select" name="value" label="Select a Default Value" defaultValue={0 || ''}
                                                        options={self.getFormData(formData, `form.references.service_template_properties[${prop.objectName}]`) || []}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="checkbox" name="value" label="Default Value" defaultValue={false}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                            </Inputs>

                                            <Inputs type="select" name="private" label="Private?" defaultValue={false}
                                                    options={[{'Yes': true}, {'No': false}]} filter={self.advanceOptionsFilter}
                                                    manageDependency={[{name: "prompt_user", dependsOn: "required", valFun : function(value, child){
                                                        child.props.onChange((value != "false").toString());
                                                    }
                                                    }]}
                                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}>

                                                <Inputs type="select" name="required" label="Required?" unmountValue={false} defaultValue={false}
                                                        options={[{'Yes': true}, {'No': false}]}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                <Inputs type="select" name="prompt_user" label="Prompt User" unmountValue={false} defaultValue={true}
                                                        options={[{'Yes': true}, {'No': false}]}
                                                        onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                            </Inputs>

                                        </DataChild>
                                    )
                                })}
                            </div>
                            <div id="service-custom-props-add" className="button-box right">
                                <button className="btn btn-rounded btn-info" href="#" onClick={this.handleAddProp}>Add Property</button>
                            </div>
                        </div>
                    </div>

                    <div id="service-submission-box" className="button-box right">
                        <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>Go Back</Link>
                        <button className="btn btn-rounded btn-primary" type="submit" value="submit">
                            {self.state.currentAction == '_CREATE' ? 'Create Service' :
                                self.state.currentAction == '_EDIT' ? 'Submit Changes' : 'Submit'}</button>
                    </div>
                </DataForm>
                {/*<DataFromReview reviewJSON={reviewJSON}/>*/}
            </div>
        );
    }

    render() {

        if(this.state.loading){
            return <Load/>;
        }else {
            if(this.state.submitSuccessful) {
                return (
                    <div>
                        <p><strong>Your service has been created.</strong></p>
                        <ul>
                            <li>Name: {this.state.submissionResponse.name}</li>
                            <li>Description: {this.state.submissionResponse.description}</li>
                        </ul>
                        <Link className="btn btn-rounded btn-default" to={'/manage-catalog/list'}>View Services</Link>
                    </div>
                )
            }else {

                let getModals = ()=> {
                    if(this.state.addCategoryModal){
                        return (
                            <ModalAddCategory show={this.state.addCategoryModal} hide={this.closeAddCategoryModal}/>
                        )
                    }
                };

                if (this.props.params.templateId && this.props.params.templateId !== null) {
                    return (
                        <div>
                            {this.processForm(this.props.params.templateId)}
                            {getModals()}
                        </div>
                    );
                } else {
                    return (
                        <div>
                            {this.processForm()}
                            {getModals()}
                        </div>
                    );
                }
            }
        }
    }

}

class CustomPropNameField extends React.Component {

    //This is for hiding machine name and set it to whatever label is replacing spaces with _
    constructor(props){
        super(props);
        this.state = {
            objectName: this.props.objectName,
            label: this.props.defaultValues ? this.props.defaultValues.label : '',
            name : this.props.defaultValues ? this.props.defaultValues.name : '',
            firstLoad : true
        };

        this.myChange = this.myChange.bind(this);
    }

    componentDidMount(){
            this.props.onChange(this.state.label, null, "prop_label");
            this.props.onChange(this.state.name, null, "name");
            this.setState({firstLoad: false});
    }

    myChange(e){
        let objectName = this.state.objectName;
        let labelVal = e.target.value;
        let nameVal = labelVal.replace(/ /g,"_").toLowerCase();

        let set = {"form" : {"references" : {"service_template_properties" : {[objectName] : {$merge: {"prop_label" : labelVal, "name" : nameVal}}}}}};
        this.props.onChange(null, set);
    }

    render(){
        let change = this.myChange;
        if(this.state.firstLoad){
            change = this.props.onChange;
        }
        let defaultLabel = this.state.label || '';
        let defaultName = this.state.name || '';


       return(
            <div>
                <div className={`form-group ${this.props.error ? 'has-error' : ''} ${this.props.warning ? 'has-warning' : ''}`}>
                    <label className="control-label">Label</label>
                    <input className={this.props.error ? this.props.className : 'form-control'}
                           ref="label" type="text" name="prop_label" label="Name" defaultValue={defaultLabel} onChange={change}/>
                    {this.props.error && <span className="help-block">{this.props.error}</span> }
                    {this.props.warning && <span className="help-block">{this.props.warning}</span> }
                    <input ref="name" type="hidden" name="name" label="Machine Name" defaultValue={defaultName} onChange={change}/>
                </div>
            </div>
       );

    }
}

export default ServiceTemplateForm;