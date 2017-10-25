import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Inputs from "../../utilities/inputs.jsx";
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";
let _ = require("lodash");

class ServiceInstanceFormEdit extends React.Component {

    constructor(props){
        super(props);
        let templateId = this.props.templateId;
        let instance = this.props.myInstance;
        this.state = {
            instance: instance,
            templateId: templateId,
            template: false,
            url: "/api/v1/service-templates/" + templateId + "/request",
            loading: true,
            success: false,
            countDown: 5
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleCountDownClose = this.handleCountDownClose.bind(this);
        this.getValidators = this.getValidators.bind(this);
    }

    componentDidMount() {
        let self = this;
                    self.setState({loading:false});

        // Fetcher(self.state.url).then(function(response){
        //     if(response != null){
        //         if(!response.error){
        //             console.log(response);
        //             self.setState({loading:false, template: response});
        //         }
        //     }
        //     self.setState({loading:false});
        // })
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true});
        }
    }

    handleCountDownClose(){
        if(this.state.countDown <= 0){
            this.props.onHide();
        }else{
            this.setState({countDown: this.state.countDown - 1});
        }
    }

    getValidators(){
        //This function dynamically generates validators depending on what custom properties the instance has.
        //requires references: the service template's references.service_template_properties
        //Defining general validators
        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateEmptyString     = (val) => { return val.trim() != ''};
        //Defining validators
        let validateName            = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"Field service name is required."}};
        let validateDescription     = (val) => { return validateRequired(val) && validateEmptyString(val) || {error:"field service description is required"}};

        let validatorJSON = {
            'name'              : validateName,
            'description'       : validateDescription,
            // 'references'        : {
            //     service_instance_properties :{}
            // }
        };

        // let myFields = _.filter(references, {prompt_user: true});
        //
        // myFields.forEach(field => {
        //     if (field.required) {
        //         //define validator based on each input type
        //         if (field.prop_input_type == 'text') {
        //             let validateRequiredText = (val) => {return validateRequired(val) && validateEmptyString(val) || {error:`Field ${field.name} is required.`}};
        //             validatorJSON.references.service_instance_properties.value = validateRequiredText;
        //         }
        //     }
        // });
        //


        return validatorJSON;
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            let self = this;

            setTimeout(function() {
                self.handleCountDownClose();
            }, 1000);

            return (<div>
                        <div className="p-20">
                            <p><strong>Success! your service has been updated.</strong></p>
                        </div>
                        <div className="modal-footer text-right">
                            <Buttons btnType="default" text={`Close ${this.state.countDown}`} onClick={this.props.onHide}/>
                        </div>
                    </div>
            );
        }else{
            const instance = this.state.instance;
            const instance_props = this.state.instance.references.service_instance_properties;
            // const references = this.state.template.references.service_template_properties.length > 0 ? this.state.template.references.service_template_properties : false;


            //TODO: Add validation functions and pass into DataForm as props
            //** Stripe limits the trial days to 2 years
            const myValidators = this.getValidators();

            return (
                <div>
                    <DataForm validators={myValidators} handleResponse={this.handleResponse} url={`/api/v1/service-instances/${instance.id}`} method={'PUT'}>

                        <div className="p-20">
                            <div className="row">
                                <div className="basic-info col-md-12">
                                    <h3 className="p-b-20">Basic Info</h3>

                                    <Inputs type="text" label="Service Name" name="name" defaultValue={instance.name}
                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                    <Inputs type="text" label="Service Description" name="description" defaultValue={instance.description}
                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                </div>
                            </div>
                            {/*{references ?*/}
                                {/*<div className="row">*/}
                                    {/*<div className="col-md-12">*/}
                                        {/*<h3 className="p-b-20">Service Fields</h3>*/}
                                        {/*{references.map( reference => (*/}
                                            {/*<div key={`custom-fields-${reference.prop_label}`}>*/}
                                                {/*<DataChild modelName="service_instance_properties" objectName={reference.name}>*/}
                                                    {/*<Inputs type="hidden" name="id" value={_.filter(instance_props, {name: reference.name}).length > 0 ? _.filter(instance_props, {name: reference.name})[0].id : ()=>{console.log("im so weird", _.filter(instance_props, {name: reference.name}))}}*/}
                                                            {/*onChange={function(){}} receiveOnChange={true} receiveValue={true}/>*/}
                                                    {/*<Inputs type="hidden" name="name" value={_.filter(instance_props, {name: reference.name}).length > 0 ? _.filter(instance_props, {name: reference.name})[0].name : ''}*/}
                                                            {/*onChange={function(){}} receiveOnChange={true} receiveValue={true}/>*/}
                                                    {/*<Inputs type={reference.type}*/}
                                                            {/*label={reference.prop_label || 'No label'}*/}
                                                            {/*name="value"*/}
                                                            {/*defaultValue={_.filter(instance_props, {name: reference.name}).length > 0 ? _.filter(instance_props, {name: reference.name})[0].value : ''}*/}
                                                            {/*options={reference.prop_values}*/}
                                                            {/*onChange={function(){}} receiveOnChange={true} receiveValue={true}/>*/}
                                                {/*</DataChild>*/}
                                            {/*</div>*/}
                                        {/*))}*/}
                                    {/*</div>*/}
                                {/*</div> : <div/>*/}
                            {/*}*/}
                        </div>

                        <div id="request-submission-box" className="modal-footer text-right">
                            <Buttons containerClass="inline" btnType="primary" text="Submit" type="submit" value="submit"/>
                            <Buttons containerClass="inline" btnType="default" text="Close" onClick={this.props.onHide}/>
                        </div>

                    </DataForm>
                </div>
            );
        }
    }
}

export default ServiceInstanceFormEdit;
