import React from 'react';
import FeaturedImage from './featured-elements/featured-image.jsx';
import { connect } from 'react-redux'
let _ = require("lodash");
import {AdminEditingGear, AdminEditingSidebar}from "./admin-sidebar.jsx";

class Featured extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            imageURL: this.props.imageURL,
            editingMode: false,
            editingGear: false
        };

        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.toggleOnEditingGear = this.toggleOnEditingGear.bind(this);
        this.toggleOffEditingGear = this.toggleOffEditingGear.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.imageURL){
            // console.log("Featured Image got new image", nextProps.imageURL);
            this.setState({imageURL: nextProps.imageURL});
        }
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

        let featuredBackgroundColor = {};

        if(this.props.options) {
            let options = this.props.options;
            featuredBackgroundColor.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
        }

        return (
            <div className={`featured`} onMouseEnter={this.toggleOnEditingGear} onMouseLeave={this.toggleOffEditingGear}>
                <FeaturedImage image={this.state.imageURL} bgColor={featuredBackgroundColor}/>
                {this.props.children}

                {this.state.editingGear && <AdminEditingGear toggle={this.toggleEditingMode}/>}
                {this.state.editingMode && <AdminEditingSidebar toggle={this.toggleEditingMode}
                                                                filter = {["home_hero_image",
                                                                    "home_featured_heading",
                                                                    "home_featured_description",
                                                                    "home_featured_text_color"]
                                                                }/>
                }
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(Featured);