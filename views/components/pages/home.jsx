import React from 'react';
import {browserHistory} from 'react-router';
import Featured from "../layouts/featured.jsx";
import Content from "../layouts/content.jsx";
import PageSection from "../layouts/page-section.jsx";
import Buttons from "../elements/buttons.jsx";
import SearchServiceBar from "../elements/home/service-list-search.jsx";
import ServiceList from "../elements/home/service-list.jsx";
import {AdminEditingGear, AdminEditingSidebar}from "../layouts/admin-sidebar.jsx";
import { connect } from 'react-redux';
let _ = require("lodash");


class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            serviceUrl : "/api/v1/service-templates/public?order_by=created_at&limit=6&order=desc",
            searchValue : "",
            editingMode: false,
            editingGear: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.toggleOnEditingGear = this.toggleOnEditingGear.bind(this);
        this.toggleOffEditingGear = this.toggleOffEditingGear.bind(this);
    }

    handleChange(event){
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        if(value != ''){
            this.setState({serviceUrl : "/api/v1/service-templates/search?key=name&value=" + value, searchValue:value});
        }else{
            this.setState({serviceUrl : "/api/v1/service-templates", searchValue:""});
        }
    }

    componentDidMount(){
        document.body.classList.add('home')
    }

    componentWillUnmount(){
        document.body.classList.remove('home')
    }

    toggleEditingMode(){
        if(this.state.editingMode){
            this.setState({editingMode: false})
        }else{
            this.setState({editingMode: true})
        }
    }
    toggleOnEditingGear(){
        this.setState({editingGear: true})
    }
    toggleOffEditingGear(){
        this.setState({editingGear: false})
    }

    render () {
        let featuredServicesHeading, featuredServicesShowAllButton, featuredServiceSectionBackgroundColor = "";

        if(this.props.options) {
            let options = this.props.options;
            featuredServicesHeading = _.get(options, 'featured_service_heading.value', "Featured Services");
            featuredServicesShowAllButton = _.get(options, 'featured_service_show_all_button_text.value', "Show All Services");
            featuredServiceSectionBackgroundColor = _.get(options, 'featured_service_section_background_color.value', "Show All Services");
        }

        return(
            <div className="page-home">
                <HomeFeatures/>
                <Content>
                    <PageSection style={{background: featuredServiceSectionBackgroundColor}}
                                 onMouseEnter={this.toggleOnEditingGear}
                                 onMouseLeave={this.toggleOffEditingGear}>
                        <div>
                            <h2 className="section-heading">{featuredServicesHeading}</h2>
                            <ServiceList url={this.state.serviceUrl}/>
                            <Buttons
                                text={featuredServicesShowAllButton}
                                size="lg" position="center" btnType="primary"
                                style={{marginTop: '15px'}}
                                onClick={()=>{browserHistory.push('/all-services')}}
                            />
                            {this.state.editingGear && <AdminEditingGear toggle={this.toggleEditingMode} name="Featured Services Settings"/>}
                            {this.state.editingMode && <AdminEditingSidebar toggle={this.toggleEditingMode}
                                                                            filter = {["featured_service_heading",
                                                                                "service_box_body_text_color",
                                                                                "service_box_body_background_color",
                                                                                "service_box_icon_display",
                                                                                "service_box_request_button_text",
                                                                                "service_box_category_display",
                                                                                "service_box_header_text_color",
                                                                                "service_box_header_background_color",
                                                                                "featured_service_show_all_button_text",
                                                                                "featured_service_section_background_color"]
                                                                            }/>
                            }
                        </div>
                    </PageSection>
                </Content>
            </div>
        );
    }
}

class HomeFeatures extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            editingMode: false,
            editingGear: false
        };

        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.toggleOnEditingGear = this.toggleOnEditingGear.bind(this);
        this.toggleOffEditingGear = this.toggleOffEditingGear.bind(this);
    }

    toggleEditingMode(){
        if(this.state.editingMode){
            this.setState({editingMode: false})
        }else{
            this.setState({editingMode: true})
        }
    }
    toggleOnEditingGear(){
        this.setState({editingGear: true})
    }
    toggleOffEditingGear(){
        this.setState({editingGear: false})
    }

    render(){
        let featuredAreaStyle = this.props.featuredAreaStyle || {
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '11',
                textAlign: 'center',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            };

        let featuredHeading, featuredDescription = "";

        let options = this.props.options;
        featuredHeading = _.get(options, 'home_featured_heading.value', '"You can set this heading in system options');
        featuredDescription = _.get(options, 'home_featured_description.value', "You can set this text in system options");

        let featuredHeadingStyle = this.props.featuredHeadingStyle || {
                fontSize: '72px',
                marginBottom: '30px',
                color: _.get(this.props.options, 'home_featured_text_color.value', '#ffffff')
            };

        let featuredIntroStyle = this.props.featuredIntroStyle || {
                fontSize: '26px',
                color: _.get(this.props.options, 'home_featured_text_color.value', '#ffffff')
            };
        return(
            <Featured imageURL="/api/v1/system-options/file/front_page_image">
                <PageSection onMouseEnter={this.toggleOnEditingGear} onMouseLeave={this.toggleOffEditingGear}>
                    <div className="featured-intro" style={featuredAreaStyle}>
                        <h1 style={featuredHeadingStyle}>{featuredHeading}</h1>
                        <p style={featuredIntroStyle}>{featuredDescription}</p>
                        {/*{this.state.searchBar &&*/}
                        {/*<SearchServiceBar searchValue={this.state.searchValue} handleChange={this.handleChange}/>*/}
                        {/*}*/}
                        {this.state.editingGear &&
                        <AdminEditingGear toggle={this.toggleEditingMode} name="Featured Section Settings"/>
                        }
                    </div>
                    {this.state.editingMode &&
                    <AdminEditingSidebar toggle={this.toggleEditingMode}
                                         filter = {["home_hero_image",
                                             "home_featured_heading",
                                             "home_featured_description",
                                             "home_featured_text_color"]}/>
                    }
                </PageSection>
            </Featured>
        );
    }
}
HomeFeatures = connect((state) => {return {options:state.options}})(HomeFeatures);
export default connect((state) => {return {options:state.options}})(Home);
