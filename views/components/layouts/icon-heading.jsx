import React from 'react';

class IconHeading extends React.Component {

    render () {
        return (
            <div className="icon-heading">
                <h3>
                    {this.props.icon && <i className={`fa fa-${this.props.icon} m-r-30`} />}
                    {this.props.imgIcon && <img src={this.props.imgIcon}/>}
                    {this.props.title ? this.props.title : "title is a required prop"}</h3>
            </div>
        );
    }
}

export default IconHeading;
