import React from 'react';
import {Link, hashHistory} from 'react-router';
import Alert from 'react-s-alert';
import Authorizer from "../utilities/authorizer.jsx"
import {DataForm, DataChild} from "../utilities/data-form.jsx";
import Featured from "../layouts/featured.jsx";
import Content from "../layouts/content.jsx";
import SearchServiceBar from "../elements/home/service-list-search.jsx";
import ServiceList from "../elements/home/service-list.jsx";

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {serviceUrl : "/api/v1/service-templates", searchValue : ""};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event){
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        console.log(value);
        this.setState({serviceUrl : "/api/v1/service-templates/search?key=name&value=" + value, searchValue:value});
    }

    componentWillUnmount(){
        document.body.classList.remove('home')
    }

    componentDidMount(){
        document.body.classList.add('home')
    }

    render () {
        var self = this;
        return(
            <div className="page-home">
                <Featured>
                    <SearchServiceBar searchValue={this.state.searchValue} handleChange={this.handleChange}/>
                </Featured>
                <Content>
                    <ServiceList url={this.state.serviceUrl}/>
                </Content>
            </div>
        );
    }
}

export default Home;
