import React from 'react';
import FeaturedImage from './featured-elements/featured-image.jsx';

class Featured extends React.Component {

    render () {
        return (
            <div className={`featured`}>
                {/*<Skyline/>*/}
                <FeaturedImage image="/api/v1/system-options/file/front_page_image"/>
                {this.props.children}
            </div>
        );
    }
}

export default Featured;
