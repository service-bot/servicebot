import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import { store, initializedState } from "../../store";
class GenericNotFound extends React.Component {

    constructor(props){
        super(props);
    }


    componentDidMount(){
        document.getElementById('servicebot-loader').classList.add('move-out');
        document.body.classList.add('page-404');

    }

    componentWillUnmount(){
        store.dispatch(initializedState());
        document.body.classList.remove('page-404');
    }


    render () {
        return(
            <div>
                <div className="page-service-instance" style={{marginTop: '100px'}}>
                    <Content>
                        <div className="row m-b-20">
                            <div className="not-found-404">
                                <img src="/assets/backgrounds/404-page.png"/>
                                <Link className="btn btn-info btn-rounded btn-md btn-outline btn-404-go-home" to="/">Go Home</Link>
                            </div>
                        </div>
                    </Content>
                </div>
            </div>
        );
    }
}

export default GenericNotFound;
