import React from 'react';

class SVGIcons extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        let {children, id, width, height, fillColor} = this.props;

        return(
            <svg version="1.1" id={id} width={width} height={height} fill={fillColor}
                 xmlns="http://www.w3.org/2000/svg"
                 xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 512 512"
                 xmlSpace="preserve"
                 style={{"enableBackground":"new 0 0 512 512"}}>
                {children}
            </svg>
        )
    }

}

export default SVGIcons;