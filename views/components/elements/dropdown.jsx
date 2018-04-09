import React from 'react';
import {Link, hashHistory} from 'react-router';
import _ from "lodash";
import $ from "jquery";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";

class Dropdown extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(this.refs.dropdownToggle).dropdown();
    }

    getButton(item){

        if(item.type == "divider"){
            return (
                <li role="separator" className="divider"/>
            )
        }else if(item.type == "button"){
            return (
                <li>
                    <a onClick={item.action}>{item.label}</a>
                </li>
            )
        }else if(item.type == "link"){
            return (
                <li>
                    <a href={item.action}>{item.label}</a>
                </li>
            )
        }
    }

    render() {
        return (
            <div className="dropdown">
                <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenuButton"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ref="dropdownToggle">
                    Actions
                </button>
                <ul className={`dropdown-menu ${this.props.direction ? (this.props.direction == 'right' ? 'dropdown-menu-right' : '') : ''}`}>
                    {this.props.dropdown.map((item, index) =>
                            this.getButton(item)
                    )}
                </ul>
            </div>
        );
    }
}

export default Dropdown;
