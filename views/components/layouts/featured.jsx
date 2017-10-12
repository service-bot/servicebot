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
        let {options, className, style, children, overlay} = this.props;
        featuredBackgroundColor.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
        let overlayStyle = {
          position: 'absolute',
            height: '100%',
            width: '100%',
            top: '0px',
        };
        if(overlay){
            overlayStyle = {
                ...overlayStyle,
                ...overlay.style,
            }
        }

        return (
            <div className={`featured ${className}`} style={style}
                 onMouseEnter={this.toggleOnEditingGear} onMouseLeave={this.toggleOffEditingGear}>
                <FeaturedImage image={this.state.imageURL} bgColor={featuredBackgroundColor}/>
                {overlay && overlay.show && <div className="hahaha" style={overlayStyle}/>}
                {children}
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(Featured);