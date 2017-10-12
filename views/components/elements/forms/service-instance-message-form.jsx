import React from 'react';
import cookie from 'react-cookie';
import {DataForm} from "../../utilities/data-form.jsx";
import Inputs from "../../utilities/inputs.jsx"
import Buttons from "../buttons.jsx";

class ServiceInstanceMessageForm extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        let id = this.props.instanceId;
        this.state = {
            instanceId: id,
            currentUser: uid,
            ajaxLoad: false,
            url: `/api/v1/service-instance-messages`,
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getValidators = this.getValidators.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleResponse(response){
        this.props.handleComponentUpdating();
        this.setState({ajaxLoad: false});
    }

    getValidators(references = null){

        let validateRequired        = (val) => { return val === 0 || val === false || val != '' && val != null};
        let validateEmptyString     = (val) => { return val.trim() != ''};

        let validateMessage         = (val) => { return (validateRequired(val) && validateEmptyString(val)) || {error:"Message cannot be empty."}};

        let validatorJSON = {
            'message' : validateMessage,
        };


        return validatorJSON;
    }

    handleSubmit(){
        this.setState({ajaxLoad: true});
    }

    render () {

        let self = this;
        return (
            <div>
                <DataForm validators={this.getValidators(null)} handleResponse={this.handleResponse} url={`${self.state.url}`} method={'POST'}>
                    <div className="m-b-20">
                        <Inputs type="hidden" name="user_id" value={self.state.currentUser}
                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                        <Inputs type="hidden" name="service_instance_id" value={self.state.instanceId}
                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                        {/*TODO: Reset Inputs after submission*/}
                        <Inputs type="textarea" name="message" defaultValue="" rows="4"
                                label="Leave your comments or questions and we will respond as soon as we can!"
                                onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                    </div>
                    <div className="text-right">
                        <Buttons btnType="primary" text="Comment" onClick={this.handleSubmit}
                                 type="submit" value="submit" loading={this.state.ajaxLoad}/>
                    </div>
                </DataForm>
            </div>
        );
    }
}

export default ServiceInstanceMessageForm;
