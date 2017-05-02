import React from 'react';
import {Link} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import cookie from 'react-cookie';
import ModalInvoice from '../elements/modals/modal-invoice.jsx';
import $ from "jquery";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import { connect } from 'react-redux';

const AnonymousLinks = ({signUpEnabled}) => (
    <ul className="nav navbar-nav navbar-right">
        <li><Link to="login">Log In</Link></li>
        {signUpEnabled &&
        <li><Link to="signup">Sign up</Link></li>
        }
    </ul>

)

const getSignUpStatus = (state) => {
    if(!state.options || !state.options.allow_registration){
        return {signUpEnabled: true};
    }
    console.log("SIGN UP", state.options);
    return {
        signUpEnabled: (state.options.allow_registration.value == "true")
    }
}

const VisibleAnonymousLinks = connect(getSignUpStatus)(AnonymousLinks);

class NavBootstrap extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        this.state = {InvoiceModal: false, uid: uid, sidebar: false};
        this.onOpenInvoiceModal = this.onOpenInvoiceModal.bind(this);
        this.onClose = this.onClose.bind(this);
        this.getMenuItems = this.getMenuItems.bind(this);
        this.toggleSideBar = this.toggleSideBar.bind(this);
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

    getMenuItems(){
        if(isAuthorized({permissions: ["can_administrate", "can_manage"]})){
            return(
                <ul className="nav navbar-nav">
                    <li><Link to="/dashboard">Dashboard<span className="sr-only">(current)</span></Link></li>
                    {/*<li><Link to="/service-catalog">Service Catalog</Link></li>*/}
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle" ref="dropdownToggle2" data-toggle="dropdown"
                           role="button" aria-haspopup="true" aria-expanded="false">Manage Services <span className="caret"/></a>
                        <ul className="dropdown-menu">
                            <li><Link to="/manage-catalog/list">Manage Catalog</Link></li>
                            <li><Link to="/manage-subscriptions">Manage Subscriptions</Link></li>
                            <li><Link to="/manage-users">Manage Users</Link></li>
                        </ul>
                    </li>
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle" ref="dropdownToggle3" data-toggle="dropdown"
                           role="button" aria-haspopup="true" aria-expanded="false">Manage System <span className="caret"/></a>
                        <ul className="dropdown-menu">
                            <li><Link to="/manage-permission">Manage Permission</Link></li>
                            <li><Link to="/stripe-settings">Stripe Settings</Link></li>
                            <li><Link to="/system-settings">System Settings</Link></li>
                        </ul>
                    </li>
                </ul>
            )
        }else{
            return(
                <ul className="nav navbar-nav">
                    <li><Link to="/my-services">My Services<span className="sr-only">(current)</span></Link></li>
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle" ref="dropdownToggle" data-toggle="dropdown"
                           role="button" aria-haspopup="true" aria-expanded="false">Billing <span className="caret"/></a>
                        <ul className="dropdown-menu">
                            <li><Link onClick={this.onOpenInvoiceModal}>Upcoming Invoice</Link></li>
                            <li><Link to={`/billing-history/${this.state.uid}`}>Billing History</Link></li>
                            <li><Link to={`/billing-settings/${this.state.uid}`}>Billing Settings</Link></li>
                        </ul>
                    </li>
                </ul>
            )
        }
    }

    toggleSideBar(){
        let self = this
        this.setState({sidebar: !this.state.sidebar}, function () {
            if(self.state.sidebar){
                document.body.classList.add('layout-collapsed');
            }else{
                document.body.classList.remove('layout-collapsed');
            }
        });
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
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1" aria-expanded="false" onClick={this.toggleSideBar}>
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"/>
                            <span className="icon-bar"/>
                            <span className="icon-bar"/>
                        </button>
                        <Link to="/" className="navbar-brand nav-logo"><img src="/api/v1/system-options/file/brand_logo"/></Link>
                    </div>

                    <div className="collapse navbar-collapse">
                        <Authorizer>
                            {this.getMenuItems()}
                        </Authorizer>
                        <Authorizer anonymous={true}>
                            <VisibleAnonymousLinks/>
                        </Authorizer>
                        <Authorizer>
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <div className="nav-profile badge badge-sm">
                                        <Link to="/profile">
                                            <img id="avatar-img" src={`/api/v1/users/${this.state.uid}/avatar`}
                                                 ref="avatar" className="img-circle" alt="badge"/>
                                            {this.state.loadingImage && <Load/> }
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <button className="btn btn-rounded btn-outline btn-white btn-signout"
                                            onClick={this.props.handleLogout}>Log Out</button>
                                </li>
                            </ul>
                        </Authorizer>
                    </div>
                </div>
                {/* app-wide modals */}
                {currentModal()}
            </nav>

        );
    }
}

export default NavBootstrap;
