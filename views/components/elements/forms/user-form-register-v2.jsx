import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputsV2.jsx";
import { formBuilder } from "../../utilities/form-builder";
import Buttons from "../../elements/buttons.jsx";
import Fetcher from "../../utilities/fetcher.jsx";
let _ = require("lodash");

class UserRegisterForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: true,
            roles: null,
            formURL: `/api/v1/users/${this.props.user.id}` //change the URL
        };

        this.fetchRoles = this.fetchRoles.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
    }

    handleSubmission(){

        let self = this;
        let payload = self.props.formData; // this formData object came from Redux store
        self.setState({ajaxLoad: false});
        Fetcher(this.state.formURL, 'PUT', payload).then(function (response) {
            if (!response.error) {
                self.setState({ajaxLoad: false, success: true, updatedUser: response.results.data}); //change the last one to what u are doing
            }else {
                console.error(`Server Error:`, response.error);
                self.setState({ajaxLoad: false});
            }
        });
    }

    render(){
        if(this.state.loading){
            return ( <Load/> );
        }else{
            return (
                <div className="edit-user-role-form">
                    <div className="p-20">
                        <p>Some text</p>
                        {/* Define Inputs */}
                        <Inputs type="select" label="User role" name="role_id" defaultValue={this.props.user.role_id} options={roleOptionList} />
                    </div>
                    <Buttons containerClass="inline" size="md" btnType="primary" text="Save User" value="submit" onClick={this.handleSubmission} loading={this.state.ajaxLoad}/>
                </div>
            )
        }
    }

}

const FORM_NAME = "userRegisterForm";

export default formBuilder(FORM_NAME)(UserRegisterForm)