import React from 'react';
import cookie from 'react-cookie';
import {Link} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import { connect } from "react-redux";

class SlideNavLinks extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            links: [
                { name: 'Login', url: '/login', permission: ['visitor'], icon: 'fingerprint', hidden: false },
                { name: 'Sign Up', url: '/signup', permission: ['visitor'], icon: 'fingerprint', hidden: false},
                { name: 'My Services', url: '/my-services', permission: ['authorized'], icon: 'dashboard', hidden: false},
                { group: 'Billings', permission: ['authorized'], icon: '', hidden: false, links: [
                    { name: 'Billing History', url: `/billing-history/${props.uid}`, permission: ['authorized'], icon: 'history', hidden: false},
                    { name: 'Billing Settings', url: `/billing-settings/${props.uid}`, permission: ['authorized'], icon: 'account_balance', hidden: false},
                ]},
                { name: 'Dashboard', url: '/dashboard', permission: ['can_administrate, can_manage'], icon: 'dashboard', hidden: false},
                { group: 'Manage', permission: ['can_administrate, can_manage'], icon: '', hidden: false, links: [
                    { name: 'Manage Offerings', url: '/manage-catalog/list', permission: ['can_administrate, can_manage'], icon: 'view_list', hidden: false},
                    { name: 'Manage Categories', url: '/manage-categories', permission: ['can_administrate, can_manage'], icon: 'playlist_add', hidden: false},
                    { name: 'Manage Users', url: '/manage-users', permission: ['can_administrate, can_manage'], icon: 'people', hidden: false},
                    { name: 'Manage Subscriptions', url: '/manage-subscriptions', permission: ['can_administrate, can_manage'], icon: 'card_membership', hidden: false},
                ]},
                { group: 'Manage System', permission: ['can_administrate, can_manage'], icon: '', hidden: false, links: [
                    { name: 'Stripe Settings', url: '/stripe-settings', permission: ['can_administrate, can_manage'], icon: 'settings', hidden: false},
                    { name: 'Email Settings', url: '/notification-templates', permission: ['can_administrate, can_manage'], icon: 'settings', hidden: false},
                    { name: 'Manage Permission', url: '/manage-permission', permission: ['can_administrate, can_manage'], icon: 'fingerprint', hidden: false},
                    { name: 'System Settings', url: '/system-settings', permission: ['can_administrate, can_manage'], icon: 'settings', hidden: false},
                ]},
            ]
        };

        this.getLinksByPermission = this.getLinksByPermission.bind(this);
    }

    getLinksByPermission(){

        let links = [];
        let permission = ['visitor'];
        if( this.props.user && isAuthorized({permissions: ["can_administrate", "can_manage"]}) ){
            permission = ['can_administrate, can_manage'];
        }else if( this.props.user ){
            permission = ['authorized'];
        }


        this.state.links.map( (link) => {
            if (link.permission.indexOf(permission[0]) != -1){
                links = [ ... links, link];
            }
        });

        return links;
    }

    render(){
        let myLinks = this.getLinksByPermission();

        if(myLinks) {
            return (
                <ul className="list-unstyled" id="navigation">
                    { myLinks.map((link, index) => (
                        <li key={`link-${index}`}>
                            { !link.group ?
                                <Link className="btn btn-flat" to={link.url} onClick={this.props.handleClick}>
                                    <span className="btn-title">{link.name}</span>
                                    <i className="material-icons pull-left icon">{link.icon}</i>
                                </Link> :
                                <div className="links-group">
                                    <span className="section-title">{link.group}</span>
                                    <ul className="list-unstyled">
                                        { link.links.map((groupLink, index) => (
                                            <li key={`group-link-${index}`}>
                                                <Link className="btn btn-flat" to={groupLink.url} onClick={this.props.handleClick}>
                                                    <span className="btn-title">{groupLink.name}</span>
                                                    <i className="material-icons pull-left icon">{groupLink.icon}</i>
                                                </Link>
                                            </li>
                                        ))
                                        }
                                    </ul>
                                </div>
                            }
                        </li>
                    ))
                    }
                </ul>
            );
        }else{
            return (
                <span>no links</span>
            )
        }

    }

}

class SideNav extends React.Component {

    handleLinkClick(){
        document.body.classList.remove('layout-collapsed');
        document.getElementById("sidebar-backdrop").classList.remove('in');
        document.getElementById("sidebar-backdrop").classList.remove('fade');
    }

    render () {
        let style = {};
        let bgColor = '';
        if(this.props.options){
            if(this.props.options.primary_theme_background_color){
                style = { ...style, backgroundColor: this.props.options.primary_theme_background_color.value}
                bgColor = this.props.options.primary_theme_background_color;
            }
        }


        let uid = cookie.load("uid");
        let email = cookie.load("username");

        let logout = ()=> {
            this.props.toggleSidebar();
            this.props.sidebarLogout();
        };

        return (
            <div className="left-sidebar-1">
                <div className="wrapper">
                    <div className="content">
                        {/*<div className="logo">*/}
                            {/*<Link to="/" className="navbar-brand nav-logo"><img src="/api/v1/system-options/file/brand_logo"/></Link>*/}
                        {/*</div>*/}
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
                            <div className="sidebar-heading" style={style}>
                                <div className="sidebar-image">
                                    <img src={`/api/v1/users/${uid}/avatar`} className="img-circle img-fluid" alt="sidebar-image" />
                                </div>
                                <div className="sidebar-options">
                                    <div className="dropdown">
                                        <Link className="btn btn-primary btn-raised dropdown-toggle" data-toggle="dropdown">{email} </Link>
                                        <button className="btn btn-link btn-signout" onClick={logout}>Log Out</button>
                                    </div>
                                </div>
                            </div>
                        </Authorizer>

                        <div className="left-sidebar-section">
                            {/* Login */}
                            <SlideNavLinks uid={this.props.uid} user={this.props.user} handleClick={this.handleLinkClick}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};

export default connect(mapStateToProps)(SideNav);
