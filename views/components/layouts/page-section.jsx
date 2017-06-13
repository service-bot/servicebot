import React from 'react';

class PageSection extends React.Component {

    render () {
        return (
            <div className="section">
                <div className={this.props.type ? this.props.type : "container"}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default PageSection;
