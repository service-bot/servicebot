import React from 'react';
import {Link} from 'react-router';
import Load from '../../utilities/load.jsx';
import Authorizer from "../../utilities/authorizer.jsx";
import Inputs from "../../utilities/inputs.jsx";
import Buttons from "../buttons.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import DateFormat from '../../utilities/date-format.jsx';
import ImageUploader from '../../utilities/image-uploader.jsx';
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import {inputField} from "./servicebot-base-field.jsx";
import {Field,} from 'redux-form';
import { required, email, numericality, length } from 'redux-form-validators';

class UserFormEdit extends React.Component {

    constructor(props){
        super(props);
        let user = this.props.myUser;
        this.state = {
            user: user,
            url: `/api/v1/users/${user.id}`,
            profileImage: `/api/v1/users/${user.id}/avatar`,
            currentAction: '_VIEW',
            imageSelected: false,
            loading: false,
            ajaxLoad: false,
            success: false,
            disableSubmit: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getMessage = this.getMessage.bind(this);
        this.onStartEdit = this.onStartEdit.bind(this);
        this.onStopEdit = this.onStopEdit.bind(this);
        // this.validatePassword = this.validatePassword.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(this.props.myUser != nextProps.myUser){
            this.setState({ user: nextProps.myUser,
                            url: `/api/v1/users/${nextProps.myUser.id}`,
                            profileImage: `/api/v1/users/${nextProps.myUser.id}/avatar`
            });
        }
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true, currentAction: '_VIEW', user: response.results.data});
        }
    }

    onStartEdit(){
        this.setState({currentAction: '_EDITING', success: false});
    }
    onStopEdit(){
        this.setState({currentAction: '_VIEW'});
    }

    getMessage(){
        if(this.state.success){
            return(
                <div className="alert alert-success" role="alert">
                    <i className="fa fa-check-circle"/>
                    <Authorizer permissions="can_administrate">
                        <Link to="/manage-users" className="btn btn-success btn-outline btn-rounded btn-sm pull-right">Back to Manage Users</Link>
                    </Authorizer>
                    Your user profile has been updated.
                </div>
            )
        }
    }

    refresh(){
        window.location.reload();
    }

    render () {
        if(this.state.loading){
            return ( <Load/> );
        }else if(!this.state.loading && this.state.currentAction === '_EDITING'){
            let user = this.state.user;

            let initialRequests = [{'method': 'GET', 'url': this.state.url}];
            let submissionRequest = {
                'method': 'PUT',
                'url': this.state.url,
            };

            let validations = values => {
                const errors = {};
                if(values.password !== values.password2){
                    errors.password2 = "Password must match";
                }
                return errors;
            };

            if(user){
                return (
                    <div className="row">
                        {this.getMessage()}
                        <div className="basic-info col-md-6 col-md-offset-3">
                            <div className="profile-header">
                                <div><h3 className="p-b-20">Editing {user.email}</h3></div>
                                <div>
                                    <small>
                                        Last Login: {user.last_login !== null ?
                                        <DateFormat time={true} date={user.last_login}/> :
                                        'Never'}
                                    </small><br/>
                                    <small>User Status: {user.status}</small>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 form-group-flex column centered p-b-10">
                                    <label className="control-label">Upload Avatar</label>
                                    <ImageUploader name="avatar" elementID="avatar" imageStyle="badge badge-xl"
                                                   imageURL={`${this.state.url}/avatar`} imageGETURL={`${this.state.url}/avatar`}
                                                   uploadButton={true} reloadNotice="Please reload the application."/>
                                </div>
                                <div id="add-category-form" className="col-md-12">
                                    <div className="row">
                                        <ServiceBotBaseForm
                                            form={userFormElements.bind(this)}
                                            initialRequests = {initialRequests}
                                            validations={validations}
                                            submissionRequest={submissionRequest}
                                            handleResponse={this.handleResponse}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }else{
                return(
                    <div>
                        <p>Unable to load your user profile</p>
                        <Buttons btnType="default" text="Try again" onClick={self.refresh}/>
                    </div>
                )
            }
        }else if(!this.state.loading && this.state.currentAction === '_VIEW'){

            let user = this.state.user;

            if(user){
                return (
                    <div className="p-20">
                        {this.getMessage()}
                        <div className="row">
                            <div className="basic-info col-md-6 col-md-offset-3">
                                <div className="profile-header">
                                    <div><h3 className="p-b-20">{user.email}</h3></div>
                                    <div>
                                        <small>Last Login: {user.last_login != null ? <DateFormat time={true} date={user.last_login}/> : 'Never'}</small><br/>
                                        <small className="text-capitalize">User Status: {user.status}</small>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 edit-profile-image">
                                        <div><div className="badge badge-xl">
                                            <img id="avatar-img" src={this.state.profileImage} ref="avatar" className="max-w-40 h-40 img-circle" alt="badge"/>
                                            {this.state.loadingImage && <Load type="avatar"/> }
                                        </div></div>
                                    </div>
                                    <div className="col-md-12 profile-info">
                                        <div>
                                            <h3>{user.name}</h3>
                                            <small>Name</small>

                                            <h3>{user.email}</h3>
                                            <small>Email</small>

                                            <h3>{user.phone}</h3>
                                            <small>Phone Number</small>
                                        </div>
                                        <Buttons btnType="default" text="Edit profile" onClick={this.onStartEdit}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }else{
                return(
                    <div>
                        <p>Unable to load your user profile</p>
                        <Buttons btnType="default" text="Try again" onClick={self.refresh}/>
                    </div>
                )
            }
        }
    }
}

function userFormElements(props){
    return (
        <form>
            <Field name="name" type="text" validate={required()}
                   component={inputField} label="Name"/>
            <Field name="email" type="email" validate={required()}
                   component={inputField} label="Email"/>
            <Field name="phone" type="tel"
                   component={inputField} label="Phone Number"/>
            <Field name="password" type="password"
                component={inputField} label="Change Password"/>
            <Field name="password2" type="password"
                   component={inputField} label="Confirm Password"/>
            <Buttons containerClass="inline" btnType="primary" text="Save Profile" type="submit" value="submit" onClick={props.handleSubmit}/>
            <Buttons containerClass="inline" btnType="default" text="cancel" onClick={this.onStopEdit}/>
        </form>
    )
}

export default UserFormEdit;
