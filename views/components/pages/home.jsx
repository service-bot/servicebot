import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import Authorizer from "../utilities/authorizer.jsx"
import {DataForm, DataChild} from "../utilities/data-form.jsx";
import Featured from "../layouts/featured.jsx";
import Content from "../layouts/content.jsx";
import PageSection from "../layouts/page-section.jsx";
import Buttons from "../elements/buttons.jsx";
import SearchServiceBar from "../elements/home/service-list-search.jsx";
import ServiceList from "../elements/home/service-list.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");


class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            serviceUrl : "/api/v1/service-templates/public?order_by=created_at&limit=6&order=desc",
            searchValue : "",
        };
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

    componentDidMount(){
        document.body.classList.add('home')
    }

    componentWillUnmount(){
        document.body.classList.remove('home')
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

        let featuredHeading, featuredDescription, featuredServicesHeading, featuredServicesShowAllButton = "";

        if(this.props.options) {
            let options = this.props.options;
            featuredHeading = _.get(options, 'home_featured_heading.value', '"You can set this heading in system options');
            featuredDescription = _.get(options, 'home_featured_description.value', "You can set this text in system options");
            featuredServicesHeading = _.get(options, 'featured_service_heading.value', "Featured Services");
            featuredServicesShowAllButton = _.get(options, 'featured_service_show_all_button_text.value', "Show All Services");
        }

        return(
            <div className="page-home">
                <Featured imageURL="/api/v1/system-options/file/front_page_image">
                    <div className="featured-intro" style={featuredAreaStyle}>
                        <h1 style={featuredHeadingStyle}>{featuredHeading}</h1>
                        <p style={featuredIntroStyle}>{featuredDescription}</p>
                        {this.state.searchBar &&
                            <SearchServiceBar searchValue={this.state.searchValue} handleChange={this.handleChange}/>
                        }
                    </div>
                </Featured>
                <Content>
                    <PageSection>
                        <h2 className="section-heading">{featuredServicesHeading}</h2>
                        <ServiceList url={this.state.serviceUrl}/>
                        <Buttons
                            text={featuredServicesShowAllButton}
                            size="lg" position="center" btnType="primary"
                            style={{marginTop: '15px'}}
                            onClick={()=>{browserHistory.push('/all-services')}}
                        />
                    </PageSection>
                </Content>
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(Home);
