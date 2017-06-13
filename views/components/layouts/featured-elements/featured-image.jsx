import React from 'react';
import './css/featured-image.css';

class FeaturedImage extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            image: this.props.image,
            bgColor: this.props.bgColor.backgroundColor || '#000000'
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.image){
            this.setState({image: nextProps.image});
        }
        if(nextProps.bgColor){
            this.setState({bgColor: nextProps.bgColor});
        }
    }

    render () {

        let style = {
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            width: "100%",
            position: "absolute"
        };

        if(this.state.image){
            style.backgroundImage = `url(${this.state.image})`;
        }else{
            style.backgroundColor = this.state.bgColor;
        }

        return (
            <div className="featured-image">
                <div className="featured-bg" style={style}></div>
            </div>
        );
    }
}

export default FeaturedImage;
