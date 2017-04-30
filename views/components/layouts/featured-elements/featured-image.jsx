import React from 'react';
import './css/featured-image.css';

class FeaturedImage extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){

    }

    render () {

        let style = {
            backgroundImage: `url(${this.props.image})`
        };

        return (
            <div className="featured-image">
                <div className="featured-bg" style={style}></div>
            </div>
        );
    }
}

export default FeaturedImage;
