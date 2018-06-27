import React from 'react';
import {Fetcher} from "servicebot-base-form"
import NavServiceBot from "./layouts/nav-servicebot.jsx"
import NavBoostrap from "./layouts/nav-bootstrap.jsx"
import Footer from "./layouts/footer.jsx"
import {browserHistory} from 'react-router';
import {connect} from "react-redux";
import {setUid, setUser, dismissAlert, setPermissions} from "./utilities/actions"
import { store } from "../store"

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {backgroundColor: '#000000'};
        this.handleLogout = this.handleLogout.bind(this);

        this.isDashboardView = this.isDashboardView.bind(this);
    }

    componentDidMount(){
    }

    handleLogout() {
        let that = this;

        Fetcher("/api/v1/auth/session/clear").then(function(result){
            localStorage.removeItem("permissions");
            that.props.logout();
            browserHistory.push('/');
        })
    }

    isDashboardView() {

        let location = this.props.location.pathname;
        let publicViewPaths = ['^\/{1}$', '^\/?service-catalog\/+\\d\/request+$', '^\/?login+$'];
        if (matchInArray(location, publicViewPaths)) {

            return false;
        }
        return true;
    }


    render () {
        let self = this;
        let background = (this.props.options && this.props.options.background_color)  ? this.props.options.background_color.value : '#ff0400';
        if(this.props.options && this.props.options.background_color){
            document.getElementById('servicebot-loader').classList.add('move-out');
        }

        this.isDashboardView();

        return(
            <div className="app-container" style={{backgroundColor: background}}>
                {this.props.modal && this.props.modal}
                <div className="app-dashboard">
                    <NavServiceBot currentPath={this.props.location.pathname} handleLogout={this.handleLogout}/>
                    <div className="app-body">
                        {self.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
let mapStateToProps = function(state){
    return {
        options : state.options,
        modal: state.modal
    }
}
let mapDispatchToProps = function(dispatch){
    return {
        logout : function(){
            dispatch(setUid(null));
            dispatch(dismissAlert([]));
            dispatch(setUser(null));
            dispatch(setPermissions([]));

        }}
}
export default connect(mapStateToProps, mapDispatchToProps)(App);

function matchInArray(string, expressions) {

    for (let i = 0; i < expressions.length; i++) {
        if (string.match(expressions[i])) {
            return true;
        }
    }

    return false;

};