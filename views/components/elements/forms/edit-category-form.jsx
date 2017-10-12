import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";
let _ = require("lodash");

class EditCategoryForm extends React.Component {

    constructor(props){
        super(props);
        let categoryId = this.props.id;
        this.state = {
            url: `/api/v1/service-categories/` + categoryId,
            response: {},
            loading: true,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true, response: response});
        }
    }

    componentDidMount() {
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    self.setState({loading:false, category: response});
                }
            }
            self.setState({loading:false});
        })
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div className="p-20">
                    <p><strong>Category Updated!</strong></p>
                    <p>{this.state.response.name || 'something went wrong.'}</p>
                </div>
            );
        }else{
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="invite-user-form">
                    <DataForm handleResponse={this.handleResponse} url={this.state.url} method={'PUT'}>

                        <div className="p-20">
                            <p><strong>Enter the category name you would like to add.</strong></p>
                            <Inputs type="text" name="name" label="Name" defaultValue={this.state.category.name}
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                            <Inputs type="text" name="description" label="Description (Optional)" defaultValue={this.state.category.description}
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                        </div>

                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" type="submit" value="submit" text="Update Category" success={this.state.success}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={this.props.hide} />
                        </div>
                    </DataForm>
                </div>
            );
        }
    }
}

export default EditCategoryForm;
