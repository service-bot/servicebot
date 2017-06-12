import React from 'react';
import {Link, hashHistory} from 'react-router';
import Alert from 'react-s-alert';
import Authorizer from "../utilities/authorizer.jsx"
import {DataForm, DataChild} from "../utilities/data-form.jsx";
import Featured from "../layouts/featured.jsx";
import Content from "../layouts/content.jsx";
import PageSection from "../layouts/page-section.jsx";
import SearchServiceBar from "../elements/home/service-list-search.jsx";
import ServiceList from "../elements/home/service-list.jsx";

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {serviceUrl : "/api/v1/service-templates", searchValue : ""};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event){
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        if(value != ''){
            console.log("has value", value);
            this.setState({serviceUrl : "/api/v1/service-templates/search?key=name&value=" + value, searchValue:value});
        }else{
            console.log("no value", value);
            this.setState({serviceUrl : "/api/v1/service-templates", searchValue:""});
        }
    }

    componentWillUnmount(){
        document.body.classList.remove('home')
    }

    componentDidMount(){
        document.body.classList.add('home')
    }

    render () {

        let featuredAreaStyle = this.props.featuredAreaStyle || {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '11',
            textAlign: 'center',
            color: 'white',
        };

        let featuredHeadingStyle = this.props.featuredHeadingStyle || {
            fontSize: '72px',
            marginBottom: '30px'
        };

        let featuredIntroStyle = this.props.featuredIntroStyle || {
            fontSize: '26px'
        };

        return(
            <div className="page-home">
                <Featured imageURL="/api/v1/system-options/file/front_page_image">
                    <div className="featured-intro" style={featuredAreaStyle}>
                        <h1 style={featuredHeadingStyle}>JD Photography</h1>
                        <p style={featuredIntroStyle}>Looking for a local professional photographer? <br/> We offer a wide election of services at a reasonable price!</p>
                        {this.state.searchBar &&
                            <SearchServiceBar searchValue={this.state.searchValue} handleChange={this.handleChange}/>
                        }
                    </div>
                </Featured>
                <Content>
                    <PageSection>
                        <ServiceList url={this.state.serviceUrl}/>
                    </PageSection>
                </Content>
            </div>
        );
    }
}

export default Home;
