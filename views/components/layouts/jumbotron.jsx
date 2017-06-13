import React from 'react';
import SearchDashboard from '../elements/my-services/dashboard-search.jsx';
import Breadcrumbs from '../utilities/breadcrumbs.jsx';
import { connect } from 'react-redux';
let _ = require("lodash");

class Jumbotron extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            systemOptions: this.props.options || {},
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.options){
            this.setState({systemOptions: nextProps.options});
        }
    }

    render () {

        let style = {};

        if(this.state.systemOptions) {
            let options = this.state.systemOptions;
            style.color = _.get(options, 'breadcrumb_color.value', "#000000");
        }

        return (
            <div className="servicetron">
                <div className="jumbotron jumbotron-fluid">
                    <div className="top-navigation">
                        <div className="nav nav-inline top-navigation-links">
                            <h1 className="display-3" style={style}>{this.props.pageName}</h1>
                            <Breadcrumbs location={this.props.location} color={style}/>
                        </div>
                        {/*<SearchDashboard/>*/}
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

export default connect((state) => {return {options:state.options}})(Jumbotron);
