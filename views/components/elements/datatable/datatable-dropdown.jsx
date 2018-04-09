import React from 'react';
import {Link, hashHistory} from 'react-router';
import _ from "lodash";
import $ from "jquery";
import '../../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";

class Dropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {dataObject: this.props.dataObject};

        this.processDropDownButtons = this.processDropDownButtons.bind(this);
        this.processLink = this.processLink.bind(this);
        this.getButton = this.getButton.bind(this);
    }

    componentDidMount(){
        $(this.refs.dropdownToggle).dropdown();
    }

    processDropDownButtons(link, id){
        let myLink = _.isFunction(link) ? link(this.props.active) : link;

        if(myLink){

            let linkArray = myLink.split('/');
            if(linkArray.indexOf(':id') > -1){

                linkArray[linkArray.indexOf(':id')] = id;
                let resultLink = linkArray.join('/');

                return resultLink;
            }
        }
        return myLink;
    }

    processLink(button){
        let self = this;
        if(_.isFunction(button.onClick)){
            let myFunction = button.onClick;
            let myData = self.state.dataObject;

            return(
              <Link to={this.processDropDownButtons(button.link, this.props.id)} style={button.style} onClick={myFunction(myData)}>
                  { _.isFunction(button.name) ? button.name(myData) : button.name }
              </Link>
            );
        }else{
            return(
                <Link to={this.processDropDownButtons(button.link, this.props.id)} style={button.style}>
                    { _.isFunction(button.name) ? button.name(this.props.active) : button.name }
                </Link>
            );
        }
    }

    getButton(button){
        let self = this;

        if(button.name === "divider"){
            if(button.permission){
                if(isAuthorized({permissions: button.permission})){
                    return ( <li key={`${self.props.id}-separator`} role="separator" className="divider"/> );
                }else{
                    return null;
                }
            }else{
                return ( <li key={`${self.props.id}-separator`} role="separator" className="divider"/> );
            }
        }else{
            if(button.permission){
                if(isAuthorized({permissions: button.permission})){
                    return ( <li key={`button-${button.id}-${self.props.id}`} style={button.style}>{self.processLink(button)}</li> );
                }else{
                    return null;
                }
            }else{
                return ( <li key={`button-${button.id}-${self.props.id}`} style={button.style}>{self.processLink(button)}</li> );
            }
        }
    }

    render () {
        return(
            <div id="action-buttons" className="btn-group">
                <button type="button" className="btn btn-default dropdown-toggle" ref="dropdownToggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.name} <span className="caret"/>
                </button>
                <ul className={`dropdown-menu ${this.props.direction ? (this.props.direction == 'right' ? 'dropdown-menu-right' : '') : ''}`}>
                    {this.props.dropdown.map((button, index) => this.getButton(button))}
                </ul>
            </div>
        );
    }
}

export default Dropdown;
