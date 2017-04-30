import React from 'react';
import SearchDashboard from '../elements/my-services/dashboard-search.jsx';
import Breadcrumbs from '../utilities/breadcrumbs.jsx';
class Jumbotron extends React.Component {

    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className="servicetron">
                <div className="jumbotron jumbotron-fluid">
                    <div className="container-fluid">
                        <div className="top-navigation">
                            <div className="nav nav-inline top-navigation-links">
                                <h1 className="display-3">{this.props.pageName}</h1>
                                <Breadcrumbs location={this.props.location}/>
                            </div>
                            {/*<SearchDashboard/>*/}
                        </div>
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

export default Jumbotron;
