import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import Alerts from "../alerts.jsx";
import Buttons from "../buttons.jsx";
let _ = require("lodash");

class DeleteCategoryForm extends React.Component {

    constructor(props){
        super(props);
        let id = this.props.id;
        this.state = {
            url: `/api/v1/service-categories/${id}`,
            response: {},
            alerts: {},
            loading: false,
            success: false,
        };

        this.fetchDeleteCategory = this.fetchDeleteCategory.bind(this);
    }

    fetchDeleteCategory(){
        let self = this;
        console.log("HELLO!");
        console.log(this.state.url);
        Fetcher(this.state.url, 'DELETE').then(function (response) {
            console.log("in fetch delete category", response);
            if(!response.error){
                self.setState({success: true, response: response});
            }else{
                console.log("error delete category", response);
                self.setState({
                    alerts: {
                        type: 'danger',
                        icon: 'times',
                        message: response.error
                    }
                });
            }
        })
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            console.log("success response", this.state.response);
            return (
                <div>
                    <div className="p-20">
                        <p><strong>Delete Category Success!</strong></p>
                    </div>
                    <div className={`modal-footer text-right p-b-20`}>
                        <Buttons containerClass="inline" btnType="default" text="Done" onClick={this.props.hide} />
                    </div>
                </div>
            );
        }else{
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="suspend-user-form">
                    <div className="p-20">
                        {(this.state.alerts && this.state.alerts.message) &&
                        <div>
                            <Alerts type={this.state.alerts.type} message={this.state.alerts.message}/>
                        </div>
                        }
                        <p><strong>Are you sure you want to delete this Category?</strong></p>
                    </div>

                    <div className={`modal-footer text-right p-b-20`}>
                        <Buttons containerClass="inline" btnType="primary" text="Delete Category" success={this.state.success} onClick={this.fetchDeleteCategory}/>
                        <Buttons containerClass="inline" btnType="default" text="Cancel" onClick={this.props.hide} />
                    </div>
                </div>
            );
        }
    }
}

export default DeleteCategoryForm;
