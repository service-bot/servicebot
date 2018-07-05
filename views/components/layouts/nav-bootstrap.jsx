import React from 'react';
import cookie from 'react-cookie';
import {Link} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import ModalInvoice from '../elements/modals/modal-invoice.jsx';
import {AdminEditingGear, AdminEditingSidebar}from "./admin-sidebar.jsx";
import {NavNotification} from "../pages/notifications.jsx";
import SideNav from '../layouts//side-nav.jsx';
import {AppMessage} from '../elements/app-message.jsx';
import ReactTooltip from 'react-tooltip';
import consume from "pluginbot-react/dist/consume"

import { connect } from "react-redux";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import $ from "jquery";
let _ = require("lodash");

const AnonymousLinks = ({signUpEnabled}) => (
    <ul className="nav navbar-nav navbar-right">
        <li><Link to="login">Log In</Link></li>
        {signUpEnabled &&
        <li><Link to="signup">Sign up</Link></li>
        }
    </ul>
);

const getSignUpStatus = (state) => {
    if(!state.options || !state.options.allow_registration){
        return {signUpEnabled: true};
    }
    return {
        signUpEnabled: (state.options.allow_registration.value == "true")
    }
};

const VisibleAnonymousLinks = connect(getSignUpStatus)(AnonymousLinks);

class NavBootstrap extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            InvoiceModal: false,
            sidebar: false,
            systemOptions: this.props.options || {},
            editingMode: false,
            editingGear: false
        };

        this.onOpenInvoiceModal = this.onOpenInvoiceModal.bind(this);
        this.onClose = this.onClose.bind(this);
        this.getMenuItems = this.getMenuItems.bind(this);
        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.toggleSideBar = this.toggleSideBar.bind(this);
        this.toggleOnEditingGear = this.toggleOnEditingGear.bind(this);
        this.toggleOffEditingGear = this.toggleOffEditingGear.bind(this);
        this.getLivemode = this.getLivemode.bind(this);
        this.getPluginItems = this.getPluginItems.bind(this);


    }

    componentDidMount(){
        $(this.refs.dropdownToggle).dropdown();
        $(this.refs.dropdownToggle2).dropdown();
        $(this.refs.dropdownToggle3).dropdown();
    }

    componentDidUpdate(){
        $(this.refs.dropdownToggle).dropdown();
        $(this.refs.dropdownToggle2).dropdown();
        $(this.refs.dropdownToggle3).dropdown();
    }

    onOpenInvoiceModal(){
        this.setState({InvoiceModal: true});
    }

    onClose(){
        this.setState({InvoiceModal: false});
    }

    toggleEditingMode(){
        if(this.state.editingMode){
            this.setState({editingMode: false})
        }else{
            this.setState({editingMode: true})
        }
    }
    toggleOnEditingGear(){
        this.setState({editingGear: true})
    }
    toggleOffEditingGear(){
        this.setState({editingGear: false})
    }

    toggleSideBar(){
        let self = this;
        this.setState({sidebar: !this.state.sidebar}, function () {
            if(self.state.sidebar){
                document.body.classList.add('layout-collapsed');
            }else{
                document.body.classList.remove('layout-collapsed');
            }
        });
    }
    getPluginItems(){
        let user = this.props.user;
        return this.props.services.routeDefinition && this.props.services.routeDefinition.reduce((acc, route, index) => {
            if(route.isVisible(user)) {
                acc.push(<li><Link key={index} to={route.path}>{route.name}</Link></li>)
            }
            return acc;
        }, [])

    }

    getMenuItems(style){
        if(isAuthorized({permissions: ["can_administrate", "can_manage"]})){
            return(
                <ul className="nav navbar-nav">
                    <li><Link to="/dashboard" style={style}>Dashboard<span className="sr-only">(current)</span></Link></li>
                    {/*<li><Link to="/service-catalog">Service Catalog</Link></li>*/}
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle" ref="dropdownToggle2" data-toggle="dropdown"
                           role="button" aria-haspopup="true" aria-expanded="false" style={style}>Manage<span className="caret"/></a>
                        <ul className="dropdown-menu">
                            <li><Link to="/manage-catalog/list">Manage Offerings</Link></li>
                            <li><Link to="/manage-categories">Manage Categories</Link></li>
                            <li><Link to="/manage-users">Manage Users</Link></li>
                            <li><Link to="/manage-subscriptions">Manage Subscriptions</Link></li>
                        </ul>
                    </li>
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle" ref="dropdownToggle3" data-toggle="dropdown"
                           role="button" aria-haspopup="true" aria-expanded="false" style={style}>Settings<span className="caret"/></a>
                        <ul className="dropdown-menu">
                            <li><Link to="/stripe-settings">Stripe Settings</Link></li>
                            <li><Link to="/notification-templates">Email Settings</Link></li>
                            <li><Link to="/manage-permission">Permission Settings</Link></li>
                            <li><Link to="/system-settings">System Settings</Link></li>
                        </ul>
                    </li>
                    {this.getPluginItems()}
                </ul>
            )
        }else{

            return(
                <ul className="nav navbar-nav">
                    <li><Link to="/my-services" style={style}>My Account<span className="sr-only">(current)</span></Link></li>
                    <li><Link to={`/billing-history/${this.props.uid}`}>Billing History</Link></li>
                    <li><Link to={`/billing-settings/${this.props.uid}`}>Payment Method</Link></li>
                    {/*<li className="dropdown">*/}
                        {/*<a href="#" className="dropdown-toggle" ref="dropdownToggle" data-toggle="dropdown"*/}
                           {/*role="button" aria-haspopup="true" aria-expanded="false" style={style}>Billing <span className="caret"/></a>*/}
                        {/*<ul className="dropdown-menu">*/}
                            {/*<li><Link onClick={this.onOpenInvoiceModal}>Upcoming Invoice</Link></li>*/}
                            {/*<li><Link to={`/billing-history/${this.props.uid}`}>Billing History</Link></li>*/}
                            {/*<li><Link to={`/billing-settings/${this.props.uid}`}>Billing Settings</Link></li>*/}
                        {/*</ul>*/}
                    {/*</li>*/}
                    {this.getPluginItems()}

                </ul>
            )
        }
    }

    getLivemode(){
        let pk = cookie.load("spk")
        let livemode =  pk ? pk.substring(3, 7) : "";
        if(pk === undefined){
            return (
                <span data-tip data-for="notification-stripe-keys" className="notification-badge">
                    <Link to="/stripe-settings">
                        <ReactTooltip id="notification-stripe-keys" class="notification-stripe-keys"
                                      aria-haspopup='true' role='example'
                                      place="bottom" type="error" effect="solid" offset={{top: -28, left: -20}}>
                            <p><strong>You need to complete your setup to unlock certain features:</strong></p>
                                <ul>
                                    <li>User Invites</li>
                                    <li>Publishing Service Templates</li>
                                    <li>Adding funds</li>
                                    <li>Receiving Payments</li>
                                </ul>
                            <p>Click to complete</p>
                        </ReactTooltip>
                        <strong>Setup not complete</strong>
                    </Link>

                </span> );
        }
        if(livemode.toUpperCase() === "TEST") {
            return ( <span className="notification-badge"><strong>Test Mode</strong></span> );
        } else {
            return <span/>;
        }
    }

    render () {
        let self = this;
        const currentModal = ()=> {
            if(self.state.InvoiceModal){
                return(
                    <ModalInvoice show={self.state.InvoiceModal} icon="fa-credit-card" hide={self.onClose}/>
                );
            }
        };

        let navigationBarStyle = {};
        let linkTextStyle = {};
        if(this.props.options){
            let options = this.props.options;
            navigationBarStyle.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
            linkTextStyle.color = _.get(options, 'primary_theme_text_color.value', '#000000');
        }

        let embed = false;
        if(window.location.search.substring(1) === 'embed'){
            embed = true;
        }


        return (
            <div>
                {!embed &&
                <div>
                    <nav className="navbar navbar-default" style={navigationBarStyle} onMouseEnter={this.toggleOnEditingGear} onMouseLeave={this.toggleOffEditingGear}>
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <Link to="/" className="navbar-brand nav-logo"><img src="/api/v1/system-options/file/brand_logo"/></Link>
                                <Authorizer anonymous={true}>
                                    <Link className="mobile-login-button" to="/login">Login</Link>
                                </Authorizer>
                                <Authorizer>
                                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                            data-target="#bs-example-navbar-collapse-1" aria-expanded="false" onClick={this.toggleSideBar}  >
                                        <span className="sr-only">Toggle navigation</span>
                                        <span className="icon-bar"/>
                                        <span className="icon-bar"/>
                                        <span className="icon-bar"/>
                                    </button>
                                </Authorizer>
                                <span className="moble-live-mode">{this.getLivemode()}</span>
                            </div>

                            <div className="collapse navbar-collapse">
                                <Authorizer>
                                    {this.getMenuItems(linkTextStyle)}
                                </Authorizer>
                                <div className="nav navbar-nav navbar-right navvbar-badge">
                                    {this.getLivemode()}
                                </div>
                                <Authorizer anonymous={true}>
                                    <VisibleAnonymousLinks/>
                                </Authorizer>
                                <Authorizer>
                                    <ul className="nav navbar-nav navbar-right">
                                        <NavNotification/>
                                        <li>
                                            <div className="nav-profile badge badge-sm">
                                                <Link to="/profile">
                                                    <img id="avatar-img" src={`/api/v1/users/${this.props.uid}/avatar`}
                                                         ref="avatar" className="img-circle" alt="badge"/>
                                                    {this.state.loadingImage && <Load/> }
                                                </Link>
                                            </div>
                                        </li>
                                        <li>
                                            <button className="btn btn-link btn-signout"
                                                    onClick={this.props.handleLogout} style={linkTextStyle}>Log Out</button>
                                        </li>
                                    </ul>
                                </Authorizer>
                            </div>
                        </div>
                        {/* app-wide modals */}
                        {currentModal()}
                        {this.state.editingGear && <AdminEditingGear toggle={this.toggleEditingMode}/>}
                        {this.state.editingMode && <AdminEditingSidebar toggle={this.toggleEditingMode}
                                                                        filter = {[ "brand_logo",
                                                                            "primary_theme_background_color",
                                                                            "primary_theme_text_color",
                                                                            "button_primary_color",
                                                                            "button_primary_hover_color",
                                                                            "button_primary_text_color"]
                                                                        }/>
                        }
                        <AppMessage/>
                    </nav>
                    <SideNav sidebarLogout={this.props.handleLogout} toggleSidebar={this.toggleSideBar}/>
                </div>
                }
            </div>

        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options,
        nav_class: state.navbar.nav_class
    }
};

export default consume("routeDefinition")(connect(mapStateToProps)(NavBootstrap));
