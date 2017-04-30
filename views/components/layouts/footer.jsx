import React from 'react';
import {Link} from 'react-router';

class Footer extends React.Component {

    render () {
        return (
            <div className="footer">
                <p className="powerby">Powered by <Link className="powerby-servicebot" target="_blank" to="http://www.servicebot.io">servicebot.io</Link></p>
            </div>
        );
    }
}

export default Footer;
