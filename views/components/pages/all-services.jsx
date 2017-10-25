import React from 'react';
import {Link, hashHistory} from 'react-router';
import Featured from "../layouts/featured.jsx";
import Content from "../layouts/content.jsx";
import PageSection from "../layouts/page-section.jsx";
import SearchServiceBar from "../elements/home/service-list-search.jsx";
import Inputs from "../utilities/inputs.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import ServiceList from "../elements/home/service-list.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");
import IconHeading from "../layouts/icon-heading.jsx";


class AllServices extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            serviceUrl : "/api/v1/service-templates/public",
            searchValue : "",
            categories: {}
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(){
        let self = this;
        Fetcher('/api/v1/service-categories').then(function (response) {
            if(!response.error){
                self.setState({categories: response});
            }else{
                console.error("error", response);
            }
        })
    }

    handleChange(event){
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        if(value && value != 0){
            this.setState({serviceUrl : "/api/v1/service-templates/search?key=category_id&value=" + value, searchValue: value});
        }else{
            this.setState({serviceUrl : "/api/v1/service-templates/public", searchValue: ""});
        }
    }

    render () {

        let headingText = "All Products & Services";

        if(this.props.options) {
            let options = this.props.options;
            headingText = _.get(options, "services_listing_page_heading_text.value", "All Products & Services")
        }

        return(
            <div className="page-all-services">
                <Content>
                    <PageSection>
                        <div className="row">
                            <div className="col-md-6 col-sm-12">
                                <IconHeading imgIcon="/assets/custom_icons/all_services_page_heading_icon.png" title={headingText}/>
                            </div>
                            <div className="col-md-6 col-sm-12">
                                <div className="category-filter">
                                    <div className="form-group">
                                        <label className="">Filter by category</label>
                                        <select className="form-control" defaultValue="0" onChange={this.handleChange}>
                                            <option key={`categories-0`} value="0" selected>All Services</option>
                                            {this.state.categories.length && this.state.categories.map((cat) =>
                                                <option key={`categories-${cat.id}`} value={cat.id}>{cat.name}</option>)
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ServiceList url={this.state.serviceUrl}/>
                    </PageSection>
                </Content>
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(AllServices);