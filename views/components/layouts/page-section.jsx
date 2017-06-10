import React from 'react';

class PageSection extends React.Component {

    render () {
        return (
            <div className="section">
                <div className="container">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default PageSection;
