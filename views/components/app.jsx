import React from 'react';
import Fetcher from "./utilities/fetcher.jsx"
import NavBootstrap from "./layouts/nav-bootstrap.jsx"
import Footer from "./layouts/footer.jsx"
import {browserHistory} from 'react-router';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {setOptions,setUid, setUser, fetchUsers} from "./utilities/actions"
import cookie from 'react-cookie';
import { store } from "../store"


Fetcher("/api/v1/system-options/public").then(function(response) {
    store.dispatch(setOptions(response));
}).then(function() {
    // console.log("app will dispatch setUser function", cookie.load("uid"));
    fetchUsers(cookie.load("uid"), (err, user) => store.dispatch(setUser(user)));
}).catch(function (error) {
    console.log("Error", error);
    store.dispatch(setOptions(
        {backgroundColor: '#000000'}
    ));
});

store.subscribe(()=>{
    // console.log("store changed", store.getState());
});


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {backgroundColor: '#000000'};
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount(){
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
            localStorage.removeItem("permissions");
            store.dispatch(setUid(null));
            browserHistory.push('/');
        }).then(function () {
            store.dispatch(setUser(null));
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
