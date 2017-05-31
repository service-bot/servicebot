import React from 'react';
import Alert from 'react-s-alert';
import Fetcher from "./utilities/fetcher.jsx"
import NavBootstrap from "./layouts/nav-bootstrap.jsx"
import Footer from "./layouts/footer.jsx"
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {setOptions, SET_OPTIONS, SET_UID} from "./utilities/actions"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';



function appReducer(state = {options: {}, uid : 0}, action) {
    switch(action.type){
        case SET_OPTIONS :
            return Object.assign({}, state, {
                options: action.options
            });
        case SET_UID :
            return Object.assign({}, state, {
                uid : action.uid
            });
        default:
            return state;
    }
}

let store = createStore(appReducer);
Fetcher("/api/v1/system-options/public").then(function(response) {
    store.dispatch(setOptions(response));
}).catch(function (error) {
    console.log("error", error);
    store.dispatch(setOptions(
        {backgroundColor: '#000000'}
    ));
});


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {backgroundColor: '#000000'};
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount(){
        console.log('ready');
        let self = this;
        let options = null;
        store.subscribe(function(){
            let storeState = store.getState();
            if (storeState.options) {
                self.setState({backgroundColor: storeState.options.background_color ? storeState.options.background_color.value : '#0d47a1'});
            }
            if(!options && storeState.options){
                options = store.getState().options;
                document.getElementById('servicebot-loader').classList.add('move-out');
            }
        })
    }

    handleLogout() {
        let that = this;

        Fetcher("/api/v1/auth/session/clear").then(function(result){
            that.setState({uid: null})
            browserHistory.push('/');
        })
    }

    render () {
        let self = this;
        return(
            <Provider store={store}>
                <div style={{backgroundColor: this.state.backgroundColor, minHeight: 100+'vh'}}>
                    <NavBootstrap handleLogout={this.handleLogout} uid={this.state.uid}/>
                    {self.props.children}
                    <Footer/>
                </div>
            </Provider>
        );
    }
}
export default App;
