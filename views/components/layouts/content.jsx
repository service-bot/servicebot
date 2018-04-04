import React from 'react';
import SideNav from './side-nav.jsx';
import {connect} from "react-redux";

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render () {
        let style = {};
        if(this.props.primary && this.props.bgColor){
            style.backgroundColor = this.props.bgColor.value;
        }
        return (
            <div id="content" style={style}>
                <SideNav handleLogout={this.props.handleLogout}/>
                <div className="main">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
        bgColor: state.options.primary_theme_background_color
    }
}

export default connect(mapStateToProps, null)(Content);
