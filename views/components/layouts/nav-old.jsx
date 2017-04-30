import React from 'react';
import {Link} from 'react-router';
import Authorizer from "../utilities/authorizer.jsx"
import cookie from 'react-cookie';

/**
 * This is old nav from the theme, we now use nav-bootstrap.jsx
 */

class Nav extends React.Component {

    render () {
        let uid = cookie.load("uid");
        let email = cookie.load("username");
        return (
                <nav className="navbar">
                    <Authorizer>
                        <ul className="nav nav-inline navbar-left-icons">
                        <li className="nav-item">
                            <Link className="nav-link toggle-layout" href="#">
                                <i className="material-icons menu">menu</i>
                            </Link>
                        </li>
                    </ul>
                    </Authorizer>
                    <div className="nav nav-inline navbar-left-links">
                        <div className="nav-item">
                            <Link className="nav-logo" to="/">
                                <img src="/assets/logos/brand-logo.png"/>
                            </Link>
                        </div>
                        <Authorizer>
                            <div className="nav-item">
                                <Link to="/my-services" className="nav-link no-after">My Services</Link>
                            </div>
                        </Authorizer>
                        <Authorizer permissions="can_administrate">
                            <div className="nav-item">
                                <Link to="/service-catalog" className="nav-link no-after">Service Catalog</Link>
                            </div>
                        </Authorizer>
                        <Authorizer>
                            <div className="nav-item dropdown dropdown-parent">
                                <Link className="nav-link dropdown-toggle" data-toggle="dropdown" href="#">Billing</Link>
                                <div className="dropdown-menu">
                                    <Link to="/my-services/modal/upcoming-invoice" className="dropdown-item">Upcoming Invoice</Link>
                                    <Link to={`/billing-history/${uid}`} className="dropdown-item">Billing History</Link>
                                    <Link to={`/billing-settings/${uid}`} className="dropdown-item">Billing Settings</Link>
                                </div>
                            </div>
                        </Authorizer>
                        <Authorizer permissions="can_administrate">
                            <div className="nav-item dropdown dropdown-parent">
                                <Link className="nav-link dropdown-toggle" data-toggle="dropdown" href="#">Admin</Link>
                                <div className="dropdown-menu">
                                    <Link to="/manage-catalog/list" className="dropdown-item">Manage Catalog</Link>
                                    <Link to="/manage-subscriptions" className="dropdown-item">Manage Subscriptions</Link>
                                    <Link to="/manage-users" className="dropdown-item">Manage Users</Link>
                                    <Link to="/manage-roles" className="dropdown-item">Manage Roles</Link>
                                    <Link to="/system-settings" className="dropdown-item">System Settings</Link>
                                </div>
                            </div>
                        </Authorizer>
                    </div>
                    <span className="welcome">
                        <Authorizer>
                            <button className="btn btn-rounded btn-outline btn-white btn-signout" onClick={this.props.handleLogout}>Log Out</button>
                        </Authorizer>
                        <Authorizer anonymous={true}>
                            <Link to="login" className="btn btn-rounded btn-flat btn-login">Log In</Link>
                            <Link to="signup" className="btn btn-rounded btn-outline btn-white btn-signup">Sign up</Link>
                        </Authorizer>
                    </span>
                    <Authorizer>
                        <div className="dropdown user-dropdown">
                            <Link to={`/account-settings/${uid}`} aria-haspopup="true" aria-expanded="false">
                                <div className="badge badge-40">
                                    <img src={`/api/v1/users/${uid}/avatar`} className="max-w-40 h-40 img-circle" alt="badge"/>
                                </div>
                            </Link>
                        </div>
                    </Authorizer>
                </nav>
        );
    }
}

export default Nav;
