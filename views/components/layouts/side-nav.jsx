import React from 'react';
import {Link} from 'react-router';
import Authorizer from "../utilities/authorizer.jsx"
import cookie from 'react-cookie';

class SideNav extends React.Component {

    handleLinkClick(){
        console.log("handleLinkClick");
        document.body.classList.remove('layout-collapsed');
        document.getElementById("sidebar-backdrop").classList.remove('in');
        document.getElementById("sidebar-backdrop").classList.remove('fade');
    }

    render () {
        let uid = cookie.load("uid");
        let email = cookie.load("username");
        return (
            <div className="left-sidebar-1">
                <div className="wrapper">
                    <div className="content">
                        <div className="logo">
                            <Link onClick={this.handleLinkClick} className="side-nav-logo text" to="/">
                                <img src="/assets/logos/servicebot-logo.png" />
                            </Link>
                        </div>
                        {/*<div className="left-sidebar-search">*/}
                            {/*<form className="form-inline form-custom">*/}
                                {/*<i className="material-icons">search</i>*/}
                                {/*<div className="form-group">*/}
                                    {/*<label htmlFor="search" className="bmd-label-floating">Search</label>*/}
                                    {/*<input type="text" className="form-control" id="search" />*/}
                                {/*</div>*/}
                            {/*</form>*/}
                        {/*</div>*/}
                        {/* User Information: Name, Role, Thumbnail*/}
                        <Authorizer>
                            <div className="sidebar-heading">
                                <div className="sidebar-image">
                                    <img src={`/api/v1/users/${uid}/avatar`} className="img-circle img-fluid" alt="sidebar-image" />
                                </div>
                                <div className="sidebar-options">
                                    <div className="dropdown">
                                        <Link className="btn btn-primary btn-raised dropdown-toggle" data-toggle="dropdown">{email} </Link>
                                        <div className="dropdown-menu dropdown-menu-center from-top">
                                            <Link onClick={this.handleLinkClick} className="dropdown-item" to={`/account-settings/${uid}`}>
                                                <i className="material-icons icon">account_circle</i>
                                                <span className="title">Account</span>
                                            </Link>
                                            <Link onClick={this.handleLinkClick} className="dropdown-item" to={this.props.handleLogout}>
                                                <i className="material-icons icon">power_settings_new</i>
                                                <span className="title">Logout</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Authorizer>

                        <div className="left-sidebar-section">
                            <Authorizer>
                                <div className="section-title">My Services</div>
                                <ul className="list-unstyled" id="navigation">
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/my-services" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">My Dashboard</span>
                                            <i className="material-icons pull-left icon">dashboard</i>
                                        </Link>
                                    </li>
                                </ul>
                                <div className="section-title">Billings</div>
                                <ul className="list-unstyled" id="navigation">
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/my-services/modal/upcoming-invoice" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Upcoming Invoice</span>
                                            <i className="material-icons pull-left icon">attach_money</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to={`/billing-history/${uid}`} className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Billing History</span>
                                            <i className="material-icons pull-left icon">history</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to={`/billing-settings/${uid}`} className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Billing Settings</span>
                                            <i className="material-icons pull-left icon">account_balance</i>
                                        </Link>
                                    </li>
                                </ul>
                            </Authorizer>
                            <Authorizer permissions="can_administrate">
                                <div className="section-title">Admin Setting</div>
                                <ul className="list-unstyled" id="navigation">
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/service-catalog" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Service Catalog</span>
                                            <i className="material-icons pull-left icon">view_list</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/manage-catalog" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Manage Catalog</span>
                                            <i className="material-icons pull-left icon">playlist_add</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/manage-subscriptions" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Manage Subscriptions</span>
                                            <i className="material-icons pull-left icon">card_membership</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/manage-users" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Manage Users</span>
                                            <i className="material-icons pull-left icon">people</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/manage-roles" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Manage Roles</span>
                                            <i className="material-icons pull-left icon">fingerprint</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/stripe-settings" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">Stripe Settings</span>
                                            <i className="material-icons pull-left icon">settings</i>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={this.handleLinkClick} to="/system-settings" className="btn btn-flat" data-parent="#navigation">
                                            <span className="btn-title">System Settings</span>
                                            <i className="material-icons pull-left icon">settings</i>
                                        </Link>
                                    </li>
                                </ul>
                            </Authorizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SideNav;
