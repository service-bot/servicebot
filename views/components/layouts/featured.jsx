import React from 'react';
import FeaturedImage from './featured-elements/featured-image.jsx';

class Featured extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            imageURL: this.props.imageURL
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.imageURL){
            console.log("Featured Image got new image", nextProps.imageURL);
            this.setState({imageURL: nextProps.imageURL});
        }
    }

    render () {
        return (
            <div className={`featured`}>
                <FeaturedImage image={this.state.imageURL}/>
                {this.props.children}
            </div>
        );
    }
}

export default Featured;
