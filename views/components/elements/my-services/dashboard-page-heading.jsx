import React from 'react';

class DashboardPageHeading extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return (
            <div className="col-xs-12">
                <h5 className="color-grey-900 m-b-5">{this.props.pageTitle}</h5>
                <p className="color-grey-700 text-sm m-b-10">{this.props.pageDescription}</p>
            </div>
        );
    }
}

export default DashboardPageHeading;
