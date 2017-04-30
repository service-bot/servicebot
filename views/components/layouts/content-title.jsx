import React from 'react';

class ContentTitle extends React.Component {

    render () {
        return (
            <div id="content-title">
                <h4 className="p-b-20">
                    {this.props.icon && <i className={`fa fa-${this.props.icon} m-r-10`} />}
                    {this.props.imgIcon && <img scr={this.props.imgIcon} className="m-r-10" />}
                    {this.props.title ? this.props.title : "title is a required prop"}</h4>
            </div>
        );
    }
}

export default ContentTitle;
