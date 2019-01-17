import React from 'react'
import {Link} from 'react-router'
import Load from '../../utilities/load.jsx'
import Authorizer from "../../utilities/authorizer.jsx"
import Buttons from "../buttons.jsx"
import DateFormat from '../../utilities/date-format.jsx'
import ImageUploader from '../../utilities/image-uploader.jsx'
import {ServicebotBaseForm, inputField} from "servicebot-base-form"
import {Field,} from 'redux-form'
import { required, email, numericality, length } from 'redux-form-validators'
import { Section } from '../../layouts/section.jsx'
import {Columns, Rows} from '../../layouts/columns.jsx'
import Avatar from '../../elements/avatar.jsx'

class UserFormEdit extends React.Component {

    constructor(props){
        super(props);
        let user = this.props.myUser;
        this.state = {
            user: user,
            url: `/api/v1/users/${user.id}`,
            profileImage: `/api/v1/users/${user.id}/avatar`,
            imageSelected: false,
            loading: false,
            ajaxLoad: false,
            success: false,
            disableSubmit: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.getMessage = this.getMessage.bind(this);
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
            this.setState({success: true, user: response.results.data});
        }
    }

    getMessage(){
        if(this.state.success){
            return(
                <div className={"messages"}>
                    <div className="message __success" role="alert">
                        <i className="fa fa-check-circle"/>
                        <Authorizer permissions="can_administrate">
                            <Link to="/manage-users" className="buttons btn-success btn-outline btn-rounded btn-sm pull-right">Back to Manage Users</Link>
                        </Authorizer>
                        Your user profile has been updated.
                    </div>
                </div>
            )
        }
    }

    refresh(){
        window.location.reload();
    }

    render () {

        let {myUser: {id}} = this.props;
        let {loading} = this.state;

        if(loading){
            return ( <Load/> );
        }else{

            let user = this.state.user;
            let initialRequests = [{'method': 'GET', 'url': this.state.url}];
            let submissionRequest = {'method': 'PUT', 'url': this.state.url};

            let validations = values => {
                const errors = {};
                if(values.password !== values.password2){
                    errors.password2 = "Password must match";
                }
                return errors;
            };

            if(user){
                return (
                    <div className={`__user-edit-form`}>
                        <Columns>
                            <Rows>
                                <Section className={`__avatar-form`}>
                                    <h3>{user.email}</h3>
                                    <small>Last Login: {user.last_login != null ? <DateFormat time={true} date={user.last_login}/> : 'Never'}</small><br/>
                                    <small className="text-capitalize">User Status: {user.status}</small>
                                    <div className="edit-profile-image">
                                        {this.state.loadingImage ?
                                            <Load type="avatar"/> :
                                            <ImageUploader name="avatar" elementID="avatar" imageStyle="avatar __md"
                                                           imageURL={`${this.state.url}/avatar`} imageGETURL={`${this.state.url}/avatar`}
                                                           uploadButton={true} reloadNotice="Please reload the application."/>}
                                        {/*<Avatar uid={id} size={`md`}/>*/}
                                    </div>
                                </Section>
                            </Rows>
                            <Rows>
                                <Section className={`__edit-form`}>
                                    <div className={`sb-form-group`}>
                                        <h3>Account Information</h3>
                                    </div>
                                    {this.getMessage()}
                                    <ServicebotBaseForm
                                        form={userFormElements.bind(this)}
                                        initialRequests = {initialRequests}
                                        validations={validations}
                                        submissionRequest={submissionRequest}
                                        handleResponse={this.handleResponse}
                                        reShowForm={true}
                                    />
                                </Section>
                            </Rows>
                        </Columns>
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
            <Field className={`password-one`} name="password" type="password"
                component={inputField} label="Change Password"/>
            <Field className={`password-two`} name="password2" type="password"
                   component={inputField} label="Confirm Password"/>
            <Buttons containerClass="inline sb-form-group" btnType="primary" text="Save Profile" type="submit" value="submit" onClick={props.handleSubmit}/>
        </form>
    )
}

export default UserFormEdit;
