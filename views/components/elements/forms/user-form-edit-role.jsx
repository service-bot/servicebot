import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputsV2.jsx";
import { formBuilder } from "../../utilities/form-builder";
import Buttons from "../../elements/buttons.jsx";
import Fetcher from "../../utilities/fetcher.jsx";
let _ = require("lodash");

const FORM_NAME = "userEditRoleForm";

class UserFormEditRole extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: true,
            roles: null,
            formURL: `/api/v1/users/${this.props.user.id}`
        };

        this.fetchRoles = this.fetchRoles.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
    }

    componentDidMount(){
        this.fetchRoles();
    }

    fetchRoles(){
        let self = this;
        Fetcher("/api/v1/roles", "GET").then(function (response) {
            if(!response.error){
                self.setState({loading: false, roles: response});
            }
            self.setState({loading: false});
        })
    }

    handleSubmission(){

        let self = this;
        let payload = self.props.formData;
        self.setState({ajaxLoad: false});
        Fetcher(this.state.formURL, 'PUT', payload).then(function (response) {
            if (!response.error) {
                self.setState({ajaxLoad: false, success: true, updatedUser: response.results.data});
            }else {
                console.error(`Server Error:`, response.error);
                self.setState({ajaxLoad: false});
            }
        });
    }

    render(){
        if(this.state.loading){
            return ( <Load type="modal"/> );
        }else{

            const sortedRoles = _.sortBy(this.state.roles, ['id']);
            let userOptions = (userList)=> {return _.map(userList, (role)=>{ return new Object({[role.role_name]: role.id})} );};
            let roleOptionList = userOptions(sortedRoles);

            let self = this;

            if(this.state.success){
                let newRoleName = _.filter(self.state.roles, {id: self.state.updatedUser.role_id})[0].role_name;
                return (
                    <div className="edit-user-role-form">
                        <div className="p-20">
                            <p><strong>User {this.props.user.email}'s role has been changed to {newRoleName}</strong></p>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" size="md" btnType="default" text="Close" onClick={this.props.hide} />
                        </div>
                    </div>
                )
            }else{

                return (
                    <div className="edit-user-role-form">
                        <div className="p-20">
                            <p>Change user {this.props.user.email}'s role.</p>
                            <Inputs type="select" label="User role" name="role_id" defaultValue={this.props.user.role_id}
                                    options={roleOptionList} />

                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" size="md" btnType="primary" text="Save User" value="submit"
                                     onClick={this.handleSubmission} loading={this.state.ajaxLoad}/>
                            <Buttons containerClass="inline" size="md" btnType="default" text="Cancel" onClick={this.props.hide} />
                        </div>
                    </div>
                )
            }
        }
    }

}


export default formBuilder(FORM_NAME)(UserFormEditRole)