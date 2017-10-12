import React from 'react';
import Load from '../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import Fetcher from "../utilities/fetcher.jsx"
import {DataForm, DataChild} from "../utilities/data-form.jsx";
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";


class UserForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { user: {}, url: "/api/v1/users/" + props.params.userId, loading:true};
        this.handleImage = this.handleImage.bind(this);

    }

    componentDidMount() {
        var that = this;
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }
        Fetcher(that.state.url).then(function(response){
            if(!response.error){
                that.setState({user : response});
            }
            that.setState({loading:false});

        })
    }

    handleImage(e){
        var self = this;

        e.preventDefault();

        let init = { method: "PUT",
            credentials : "include",
            body : new FormData(document.getElementById("imgform"))
        };

        Fetcher(`${this.state.url}/avatar`, null, null, init).then(function(result){
        });
    }

    render() {
        if(this.state.loading)
            return <Load/>;
        if(this.state.user == {}) {
            return <p className="help-block center-align">There is no user</p>;
        }
        else {
            let user = this.state.user;

            let pageName = this.props.route.name;
            return(
                <Authorizer>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="badge badge-40"><img src={this.state.url + "/avatar"} className="max-w-40 h-40 img-circle" alt="badge"/></div>

                            <div key={user.id} className="article-item">
                                <div className="article-item-title">
                                    <div>{user.email}</div>
                                </div>
                                <Authorizer permission="can_administrate">
                                    <div className="article-item-description">
                                        Created {new Date(user.created).toDateString()}
                                    </div>
                                </Authorizer>
                            </div>

                            <h5 class="m-20 m-t-40 m-b-10">Upload your profile picture</h5>
                            <form  id="imgform" encType="multipart/form-data">
                                <input id="avatar" type="file" name="avatar"/>
                                <button type="submit" onClick={this.handleImage}>Upload</button>
                            </form>
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default UserForm
