import React from 'react';
import cookie from 'react-cookie';
import {Link} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import ModalInvoice from '../elements/modals/modal-invoice.jsx';
import {AdminEditingGear, AdminEditingSidebar} from "./admin-sidebar.jsx";
import {NavNotification} from "../pages/notifications.jsx";
import SideNav from '../layouts//side-nav.jsx';
import {AppMessage} from '../elements/app-message.jsx';
import ReactTooltip from 'react-tooltip';
import consume from "pluginbot-react/dist/consume"

import {connect} from "react-redux";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import $ from "jquery";

let _ = require("lodash");

const AnonymousLinks = ({signUpEnabled}) => (
    <ul className="app-links">
        <li className="fake">
            <span className="nav-icons icon-home"/>
            <div className="title" />
        </li>
        <li className="fake">
            <span className="nav-icons icon-manage"/>
            <div className="title small" />
        </li>
        <li className="fake">
            <span className="nav-icons icon-subscriptions"/>
            <div className="title large" />
        </li>
        <li className="fake">
            <span className="nav-icons icon-users"/>
            <div className="title micro" />
        </li>
    </ul>
);

const getSignUpStatus = (state) => {
    if (!state.options || !state.options.allow_registration) {
        return {signUpEnabled: true};
    }
    return {
        signUpEnabled: (state.options.allow_registration.value == "true")
    }
};

const VisibleAnonymousLinks = connect(getSignUpStatus)(AnonymousLinks);

class NavServiceBot extends React.Component {

    constructor(props) {
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
        this.getLinkClass = this.getLinkClass.bind(this);
        this.getSetupSteps = this.getSetupSteps.bind(this);
        this.getSetupClass = this.getSetupClass.bind(this);
        this.getSettingsMenus = this.getSettingsMenus.bind(this);

    }

    componentDidMount() {
        $(this.refs.dropdownToggle).dropdown();
        $(this.refs.dropdownToggle2).dropdown();
        $(this.refs.dropdownToggle3).dropdown();
    }

    componentDidUpdate() {
        $(this.refs.dropdownToggle).dropdown();
        $(this.refs.dropdownToggle2).dropdown();
        $(this.refs.dropdownToggle3).dropdown();
    }

    onOpenInvoiceModal() {
        this.setState({InvoiceModal: true});
    }

    onClose() {
        this.setState({InvoiceModal: false});
    }

    toggleEditingMode() {
        if (this.state.editingMode) {
            this.setState({editingMode: false})
        } else {
            this.setState({editingMode: true})
        }
    }

    toggleOnEditingGear() {
        this.setState({editingGear: true})
    }

    toggleOffEditingGear() {
        this.setState({editingGear: false})
    }

    toggleSideBar() {
        let self = this;
        this.setState({sidebar: !this.state.sidebar}, function () {
            if (self.state.sidebar) {
                document.body.classList.add('layout-collapsed');
            } else {
                document.body.classList.remove('layout-collapsed');
            }
        });
    }

    getPluginItems(icon = null) {
        let self = this;
        let user = this.props.user;
        return this.props.services.routeDefinition && this.props.services.routeDefinition.reduce((acc, route, index) => {
            if (route.isVisible(user) && (route.navType === "main" || route.navType === undefined)) {
                acc.push(<li><Link key={index} to={route.path}
                                   className={self.getLinkClass(route.path.split('/')[1], 'parent')}>{icon &&
                <span className={`nav-icons icon-${icon}`}/>}{route.name}</Link></li>)
            }
            return acc;
        }, [])

    }
    getSettingsMenus(){
        let user = this.props.user;
        let self = this;
        return this.props.services.routeDefinition && this.props.services.routeDefinition.reduce((acc, route, index) => {
            if(route.isVisible(user) && route.navType === "settings") {
                acc.push(<li><Link className={self.getLinkClass(route.path.substr(1), 'child')} key={index} to={route.path}>{route.name}</Link></li>)
            }
            return acc;
        }, [])


    }

    getLinkClass(expectedPath, linkType) {
        let path = this.props.currentPath;
        if (_.isArray(expectedPath)) {
            return _.includes(expectedPath, path.split('/')[1]) ? `nav-link-${linkType} active` : `nav-link-${linkType}`;
        }
        return path.split('/')[1] === expectedPath ? `nav-link-${linkType} active` : `nav-link-${linkType}`;
    }

    getSetupClass(linkType, setupComplete) {
        return setupComplete ? `nav-link-${linkType} _completed` : `nav-link-${linkType}`;

    }

    getSetupSteps() {
        let {options} = this.props;
        let hasOffering = this.props.hasOffering;
        let hasStripeKeys = options.stripe_publishable_key && options.stripe_publishable_key.value !== "";
        let setupComplete = hasOffering && hasStripeKeys;
        let getSetupClass = this.getSetupClass;

        if(!setupComplete) {
            return (
                <div className="nav-setup-checklist">
                    <Link to="/dashboard" className={`${getSetupClass('dashboard', 'parent')} active`}>
                        Your Checklist
                    </Link>
                    <div className="_list">
                        <Link to="/manage-catalog/create" className={getSetupClass('child', hasOffering)}>
                            <span className="form-step-count _step-count">1</span> Create SaaS Offering</Link>
                        <Link to="/stripe-settings" className={getSetupClass('child', hasStripeKeys)}>
                            <span className="form-step-count _step-count">2</span> Add Stripe keys</Link>
                    </div>
                </div>
            )
        }
    }

    getMenuItems(style) {

        //todo: do this dynamically somehow
        let linkGroupManage = ['manage-catalog', 'manage-categories', 'manage-users', 'manage-subscriptions'];
        let defaultSettingLinks = ['stripe-settings', 'notification-templates', 'system-settings'];
        let customSettingRoutes = this.props.services.routeDefinition && this.props.services.routeDefinition.reduce((acc, route, index) => {
            if(route.navType === "settings") {
                acc.push(route.path.substr(1))
            }
            return acc;
        }, []);
        let linkGroupSettings = defaultSettingLinks.concat(customSettingRoutes);
        console.log("this.props.services.routeDefinition", linkGroupSettings);
        let getLinkClass = this.getLinkClass;
        let getSetupSteps = this.getSetupSteps;
        let currentDropdown = '';

        if (isAuthorized({permissions: ["can_administrate", "can_manage"]})) {
            return (
                <ul className="app-links">
                    <li>
                        {getSetupSteps()}
                    </li>
                    <li>
                        <Link to="/" style={style} className={getLinkClass('', 'parent')}>
                            <span className="nav-icons icon-home"/>Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/manage-catalog" style={style} className={getLinkClass('manage-catalog', 'parent')}>
                            <span className="nav-icons icon-manage"/>Services
                        </Link>
                    </li>
                    <li>
                        <Link to="/manage-subscriptions" style={style}
                              className={getLinkClass('manage-subscriptions', 'parent')}>
                            <span className="nav-icons icon-subscriptions"/>Subscriptions
                        </Link>
                    </li>
                    <li>
                        <Link to="/manage-users" style={style} className={getLinkClass('manage-users', 'parent')}>
                            <span className="nav-icons icon-users"/>Users
                        </Link>
                    </li>
                    <li>
                        <Link to="/embeddables" style={style} className={getLinkClass('embeddables', 'parent')}>
                            <span className="nav-icons icon-embed"/>Embeds
                        </Link>
                    </li>
                    {this.getPluginItems('integrations')}
                    <li className="app-dropdown">
                        <Link className={getLinkClass(linkGroupSettings, 'parent')} to="/stripe-settings">
                            <span className="nav-icons icon-settings"/>Settings<span className="caret"/>
                        </Link>
                        <ul className="app-dropdown">
                            <li><Link to="/stripe-settings" className={getLinkClass('stripe-settings', 'child')}>Stripe Settings</Link></li>
                            <li><Link to="/notification-templates" className={getLinkClass('notification-templates', 'child')}>Email Settings</Link></li>
                            <li><Link to="/system-settings" className={getLinkClass('system-settings', 'child')}>System Settings</Link></li>
                            {this.getSettingsMenus()}
                            <li><Link href="https://api-docs.servicebot.io/" target="_blank" className={'nav-link-child'}>API Reference</Link></li>
                        </ul>
                    </li>
                    <li>
                        <a target="_blank" href="https://help.servicebot.io" style={style}
                           className={getLinkClass('manage-helpcenter', 'parent')}>
                            <span className="nav-icons icon-helpcenter"/>Help Center
                        </a>
                    </li>
                </ul>
            )
        } else {
            return (
                <ul className="app-links">
                    <li><Link to="/my-services" style={style}>My Account<span
                        className="sr-only">(current)</span></Link></li>
                    <li><Link to={`/billing-history/${this.props.uid}`}>Billing History</Link></li>
                    <li><Link to={`/billing-settings/${this.props.uid}`}>Payment Method</Link></li>
                    {this.getPluginItems()}
                </ul>
            )
        }
    }

    getLivemode() {
        let pk = cookie.load("spk")
        let livemode = pk ? pk.substring(3, 7) : "";
        if (pk === undefined) {
            return (
                <span data-tip data-for="notification-stripe-keys" className="notification-badge">
                    <Link to="/stripe-settings">
                        {/*<ReactTooltip id="notification-stripe-keys" class="notification-stripe-keys"*/}
                        {/*aria-haspopup='true' role='example'*/}
                        {/*place="bottom" type="error" effect="solid" offset={{top: -28, left: -20}}>*/}
                        {/*<p><strong>You need to complete your setup to unlock certain features:</strong></p>*/}
                        {/*<ul>*/}
                        {/*<li>User Invites</li>*/}
                        {/*<li>Publishing Service Templates</li>*/}
                        {/*<li>Adding funds</li>*/}
                        {/*<li>Receiving Payments</li>*/}
                        {/*</ul>*/}
                        {/*<p>Click to complete</p>*/}
                        {/*</ReactTooltip>*/}
                        <strong>No Stripe Connection</strong>
                    </Link>

                </span> );
        }
        if (livemode.toUpperCase() === "TEST") {
            return ( <span className="notification-badge stripe test m-0"><strong>Stripe Test Mode</strong></span> );
        } else {
            return ( <span className="notification-badge stripe live m-0"><strong>Stripe Live Mode</strong></span> );
        }
    }

    render() {
        let self = this;
        const currentModal = () => {
            if (self.state.InvoiceModal) {
                return (
                    <ModalInvoice show={self.state.InvoiceModal} icon="fa-credit-card" hide={self.onClose}/>
                );
            }
        };

        let navigationBarStyle = {};
        let linkTextStyle = {};
        if (this.props.options) {
            let options = this.props.options;
            navigationBarStyle.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
            linkTextStyle.color = _.get(options, 'primary_theme_text_color.value', '#000000');
        }

        let embed = false;
        if (window.location.search.substring(1) === 'embed') {
            embed = true;
        }

        if (!embed) {
            return (
                <div className="app-layout">
                    <div className="app-header">
                        <div className="app-header-left">
                            <Link to="/">
                                <img className="app-logo" src="/api/v1/system-options/file/brand_logo"/>
                            </Link>
                        </div>
                        <Authorizer>
                            <div className="app-header-right">
                                <div className="app-profile">
                                    <Link to="/profile">
                                        <img className="img-circle" src={`/api/v1/users/${this.props.uid}/avatar`}
                                             ref="avatar" alt="profile image"/>
                                        {this.state.loadingImage && <Load/>}
                                    </Link>
                                </div>
                                <NavNotification/>
                                <button className="buttons logout" onClick={this.props.handleLogout}>Log Out</button>
                            </div>
                        </Authorizer>
                    </div>
                    <div className="app-navigation">
                        <nav className="app-links-container" onMouseEnter={this.toggleOnEditingGear}
                             onMouseLeave={this.toggleOffEditingGear}>

                            {/*<div className="navbar-header">*/}
                            {/*<Authorizer anonymous={true}>*/}
                            {/*<Link className="mobile-login-button" to="/login">Login</Link>*/}
                            {/*</Authorizer>*/}
                            {/*<Authorizer>*/}
                            {/*<button type="button" className="navbar-toggle collapsed" data-toggle="collapse"*/}
                            {/*data-target="#bs-example-navbar-collapse-1" aria-expanded="false" onClick={this.toggleSideBar}  >*/}
                            {/*<span className="sr-only">Toggle navigation</span>*/}
                            {/*<span className="icon-bar"/>*/}
                            {/*<span className="icon-bar"/>*/}
                            {/*<span className="icon-bar"/>*/}
                            {/*</button>*/}
                            {/*</Authorizer>*/}
                            {/*<span className="moble-live-mode">{this.getLivemode()}</span>*/}
                            {/*</div>*/}

                            <div className="_main">
                                <Authorizer>
                                    {this.getMenuItems(linkTextStyle)}
                                </Authorizer>
                                <Authorizer anonymous={true}>
                                    <VisibleAnonymousLinks/>
                                </Authorizer>
                                {/*<Authorizer>*/}
                                {/*<ul className="nav navbar-nav navbar-right">*/}

                                {/*</ul>*/}
                                {/*</Authorizer>*/}
                                <div className="nav-footer">
                                    <div className="navvbar-badge">
                                        {this.getLivemode()}
                                    </div>
                                    <Link target="_blank" to="http://servicebot.io">
                                        Powered by Servicebot
                                    </Link>
                                    {this.props.services.footerComponent && this.props.services.footerComponent.map((comp, index) => {
                                        return (<div key={"footer-" + index}>
                                            {comp}
                                        </div>)
                                    })}
                                </div>
                            </div>

                            {/* app-wide modals */}
                            {currentModal()}
                            {this.state.editingGear && <AdminEditingGear toggle={this.toggleEditingMode}/>}
                            {this.state.editingMode && <AdminEditingSidebar toggle={this.toggleEditingMode}
                                                                            filter={["brand_logo",
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
                </div>
            );
        } else {
            return null;
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options,
        nav_class: state.navbar.nav_class,
        hasOffering: state.hasOffering
    }
};

export default consume("routeDefinition", "footerComponent")(connect(mapStateToProps)(NavServiceBot));
