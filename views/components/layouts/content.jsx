import React from 'react';
import SideNav from './side-nav.jsx'

class Content extends React.Component {

    render () {
        return (
            <div id="content" className="container-fluid">
                <div className="row">
                    <SideNav handleLogout={this.props.handleLogout}/>
                    <div className="col-xs-12 main">
                        <div className="page-on-top">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Content;
