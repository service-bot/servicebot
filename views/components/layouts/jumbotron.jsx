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

        let style = {jumbotron:{}, breadcrumbs:{}};

        if(this.state.systemOptions) {
            let options = this.state.systemOptions;
            style.jumbotron.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
            style.jumbotron.color = _.get(options, 'primary_theme_text_color.value', '#ffffff');
            style.breadcrumbs.color = _.get(options, 'breadcrumb_color.value', "#000000");
        }

        return (
            <div className="servicetron no-print">
                <div className="jumbotron jumbotron-fluid" style={style.jumbotron}>
                    <div className="top-navigation">
                        <div className="nav nav-inline top-navigation-links">
                            <h3 className="display-3" style={style.jumbotron}>{this.props.pageName}</h3>
                            {this.props.subtitle && <span>{this.props.subtitle}</span>}
                            {this.props.location && <Breadcrumbs location={this.props.location} color={style.breadcrumbs}/>}
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
