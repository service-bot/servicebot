
import React from 'react';
import Load from '../utilities/load.jsx';
import {Link, hashHistory} from 'react-router';
import Alert from 'react-s-alert';
import Fetcher from "../utilities/fetcher.jsx"
class Users extends React.Component {

    constructor(props) {
        super(props);
        this.state = { users: [], url: "/api/v1/users", loading:true};
    }

    componentDidMount() {
        var that = this;
        Fetcher(that.state.url).then(function(response){
            if(!response.error){
                that.setState({users : response});
            }
            that.setState({loading:false});
        });

    }



    render() {
        if(this.state.loading)
            return <Load/>;
        if(this.state.users.length<1) {
            return <p className="help-block center-align">There are no users</p>;
        }
        else {
            return(<div>

                <div className="yo">
                    <h3>MY USERS!</h3>
                    {this.state.users.map(user => (
                        <div key={user.id} className="article-item">
                            <div className="article-item-title">
                                <Link to={"/users/"+user.id} >{user.email}</Link>
                            </div>
                            <div className="article-item-description">
                                Created {new Date(user.created).toDateString()}
                            </div>
                            <hr className="article-separator"></hr>
                        </div>
                    ))}</div>
            </div>);
        }
    }
}

export default Users
