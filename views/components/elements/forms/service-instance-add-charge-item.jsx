import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";

class ServiceInstanceFormEdit extends React.Component {

    constructor(props){
        super(props);
        let instance = this.props.myInstance;
        this.state = {
            instance: instance,
            loading: false,
            success: false,
            ajaxLoad: false,
            countDown: 5
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleCountDownClose = this.handleCountDownClose.bind(this);
        this.getValidators = this.getValidators.bind(this);
        this.loading = this.loading.bind(this);
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true, ajaxLoad: false});
        }else{
            this.setState({ajaxLoad: false});
        }
    }

    handleCountDownClose(){
        if(this.state.countDown <= 0){
            this.props.onHide();
        }else{
            this.setState({countDown: this.state.countDown - 1});
        }
    }

    getValidators(references = null){
        //This function dynamically generates validators depending on what custom properties the instance has.
        //optional references: the service template's references.service_template_properties
        //Defining general validators
        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateEmptyString     = (val) => { return val.trim() != ''};
        let validateNumber          = (val) => { return !isNaN(parseFloat(val)) && isFinite(val) };
        //Defining validators
        let validateDescription     = (val) => { return (validateRequired(val) && validateEmptyString(val)) || {error:"Field Description is required"}};
        let validateAmount          = (val) => { return (validateRequired(val) && validateEmptyString(val) && validateNumber(val) && val >= 0) || {error:"Field amount is required and must be a number greater than or equal 0"}};

        let validatorJSON = {
            'description' : validateDescription
        };


        return validatorJSON;
    }

    loading(){
        this.setState({ajaxLoad: true});
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
                        <p><strong>Success! A line item has been added.</strong></p>
                    </div>
                    <div className="modal-footer text-right">
                        <Buttons btnType="default" text={`Close ${this.state.countDown}`} onClick={this.props.onHide}/>
                    </div>
                </div>
            );
        }else{
            const instance = this.state.instance;

            //TODO: Add validation functions and pass into DataForm as props

            return (
                <div>
                    <DataForm validators={this.getValidators(null)} handleResponse={this.handleResponse} url={`/api/v1/service-instances/${instance.id}/add-charge`} method={'POST'}>

                        <div className="p-20">
                            <div className="row">
                                <div className="basic-info col-md-12">
                                    <p><strong>Add A Line Item For {instance.name}</strong></p>
                                    <p>{instance.description}</p>

                                    <Inputs type="text" name="description" label="Description" defaultValue={''}
                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                    <Inputs type="price" name="amount" label="Price" defaultValue={0}
                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                </div>
                            </div>
                        </div>

                        <div id="request-submission-box" className="modal-footer text-right">
                            <Buttons containerClass="inline" btnType="primary" text="Submit" onClick={this.loading}
                                     type="submit" value="submit" loading={this.state.ajaxLoad}/>
                            <Buttons containerClass="inline" btnType="default" text="Close" onClick={this.props.onHide}/>
                        </div>

                    </DataForm>
                </div>
            );

        }
    }
}

export default ServiceInstanceFormEdit;
