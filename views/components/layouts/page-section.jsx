import React from 'react';

class PageSection extends React.Component {

    render () {
        let {onMouseEnter, onMouseLeave} = this.props;
        return (
            <div className="section" style={this.props.style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <div className={this.props.type ? this.props.type : "container"}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default PageSection;
