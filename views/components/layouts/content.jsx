import React from 'react';
import SideNav from './side-nav.jsx'

class Content extends React.Component {

    render () {
        return (
            <div id="content">
                <SideNav handleLogout={this.props.handleLogout}/>
                <div className="main">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Content;
