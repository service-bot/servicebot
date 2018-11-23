import React from 'react';
import {connect} from "react-redux";

class Content extends React.Component {

    render () {
        return (
            <div id="content" className={`_content-container`}>
                <div className="main _content">
                    {this.props.children}
                </div>
            </div>
        );
    };
}

function mapStateToProps(state){
    return {}
}

export default connect(mapStateToProps, null)(Content);
