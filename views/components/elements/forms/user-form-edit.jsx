import React from 'react';
import {Link} from 'react-router';
import Load from '../../utilities/load.jsx';
import Authorizer from "../../utilities/authorizer.jsx";
import Inputs from "../../utilities/inputs.jsx";
import Buttons from "../buttons.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import DateFormat from '../../utilities/date-format.jsx';
import ImageUploader from '../../utilities/image-uploader.jsx';

class UserFormEdit extends React.Component {

    constructor(props){
        super(props);
        let user = this.props.myUser;
        console.log("user", user);
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
            console.log("props updated", nextProps.myUser);
            this.setState({ user: nextProps.myUser,
                            url: `/api/v1/users/${nextProps.myUser.id}`,
                            profileImage: `/api/v1/users/${nextProps.myUser.id}/avatar`
            });
        }
    }

    handleResponse(response){
        console.log("inside handle response", response);
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
        }else if(!this.state.loading && this.state.currentAction == '_EDITING'){
            let user = this.state.user;

            if(user){
                return (
                        <div className="row">
                            {this.getMessage()}
                            <div className="basic-info col-md-6 col-md-offset-3">
                                <div className="profile-header">
                                    <div><h3 className="p-b-20">Editing {user.email}</h3></div>
                                    <div>
                                        <small>Last Login: {user.last_login != null ? <DateFormat time={true} date={user.last_login}/> : 'Never'}</small><br/>
                                        <small>User Status: {user.status}</small>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 form-group-flex column centered p-b-10">
                                        <label className="control-label">Upload Avatar</label>
                                        {/*<ImageUploader name="template-icon" elementID="template-image" imageStyle="badge badge-lg"*/}
                                                       {/*imageURL={`/api/v1/service-templates/25/icon`} />*/}
                                        <ImageUploader name="avatar" elementID="avatar" imageStyle="badge badge-xl"
                                                       imageURL={`${this.state.url}/avatar`} imageGETURL={`${this.state.url}/avatar`}
                                                       uploadButton={true} reloadNotice="Please reload the application."/>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="row">
                                            <DataForm handleResponse={this.handleResponse} url={this.state.url} method={'PUT'}>
                                                <div className="col-md-6">
                                                    <Inputs type="text" label="Name" name="name" defaultValue={user.name}
                                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                    <Inputs type="text" label="Email" name="email" value={user.email}
                                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>

                                                    <Inputs type="text" label="Phone Number" name="phone" value={user.phone}
                                                            onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                                                </div>
                                                <div className="col-md-6">
                                                    {/*<div className="form-group">*/}
                                                        {/*<label className="control-label">Password</label>*/}
                                                        {/*<input className="form-control" type="password" name="current_password"/>*/}
                                                    {/*</div>*/}

                                                    <div className="form-group">
                                                        <label className="control-label">Change Password</label>
                                                        <input className="form-control" type="password" name="password" onChange={this.validatePassword}/>
                                                    </div>

                                                    {/*<div className="form-group">*/}
                                                        {/*<label className="control-label">Confirm Password</label>*/}
                                                        {/*<input className="form-control" type="password" name="password2" onChange={this.validatePassword}/>*/}
                                                    {/*</div>*/}
                                                </div>
                                                <div className="col-md-12 text-right">
                                                    <Buttons containerClass="inline" btnType="primary" text="Save Profile" type="submit" value="submit"/>
                                                    <Buttons containerClass="inline" btnType="default" text="cancel" onClick={this.onStopEdit}/>
                                                </div>
                                            </DataForm>
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
        }else if(!this.state.loading && this.state.currentAction == '_VIEW'){

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

export default UserFormEdit;
