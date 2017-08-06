import React from 'react';
import './css/featured-image.css';

class FeaturedImage extends React.Component {

    constructor(props){
        super(props);


    }
    render () {
        let style = {
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
            position: "absolute",
            backgroundImage: `url(${this.props.image})`,
            backgroundColor: this.props.bgColor.backgroundColor || '#000000'
        };

        return (
            <div className="featured-image">
                <div className="featured-bg" style={style}></div>
            </div>
        );
    }
}

export default FeaturedImage;
