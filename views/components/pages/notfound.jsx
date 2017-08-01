import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ServiceRequestForm from "../elements/forms/service-instance-form-request.jsx"

class GenericNotFound extends React.Component {

    constructor(props){
        super(props);
    }


    componentDidMount(){
        document.getElementById('servicebot-loader').classList.add('move-out');
        document.body.classList.add('page-404');
    }

    componentWillUnmount(){
        document.body.classList.remove('page-404');
    }


    render () {
        return(
            <div>
                <div className="page-service-instance" style={{marginTop: '100px'}}>
                    <Content>
                        <div className="row m-b-20">
                            <div className="not-found-404">
                                <h1>404</h1>
                                <p>We are sorry, but you might be lost!</p>
                                <Link className="btn btn-info btn-rounded btn-md" to="/">Go Home</Link>
                            </div>
                        </div>
                    </Content>
                </div>
            </div>
        );
    }
}

export default GenericNotFound;
