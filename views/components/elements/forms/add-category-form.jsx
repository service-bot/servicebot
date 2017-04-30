import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";
let _ = require("lodash");

class AddCategoryForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            url: `/api/v1/service-categories`,
            response: {},
            loading: false,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true, response: response});
        }
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div className="p-20">
                    <p><strong>Category Added!</strong></p>
                    <p>{this.state.response.name || 'something went wrong.'}</p>
                </div>
            );
        }else{
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="invite-user-form">
                    <DataForm handleResponse={this.handleResponse} url={this.state.url} method={'POST'}>

                        <div className="p-20">
                            <p><strong>Enter the category name you would like to add.</strong></p>
                            <Inputs type="text" name="name" label="Name"
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                            <Inputs type="text" name="description" label="Description (Optional)"
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                        </div>

                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" type="submit" value="submit" text="Add Category" success={this.state.success}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={this.props.hide} />
                        </div>
                    </DataForm>
                </div>
            );
        }
    }
}

export default AddCategoryForm;
