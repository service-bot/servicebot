import React from 'react';
import FeaturedImage from './featured-elements/featured-image.jsx';
import { connect } from 'react-redux'
let _ = require("lodash");

class Featured extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            imageURL: this.props.imageURL,
            systemOptions: this.props.options || {},
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.imageURL){
            console.log("Featured Image got new image", nextProps.imageURL);
            this.setState({imageURL: nextProps.imageURL});
        }
        if(nextProps.options){
            this.setState({systemOptions: nextProps.options});
        }
    }

    componentDidMount(){
        // console.log("system options: ", this.state.options);
    }

    render () {

        let featuredBackgroundColor = {};

        if(this.state.systemOptions) {
            let options = this.state.systemOptions;
            featuredBackgroundColor.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
        }

        return (
            <div className={`featured`}>
                <FeaturedImage image={this.state.imageURL} bgColor={featuredBackgroundColor}/>
                {this.props.children}
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(Featured);