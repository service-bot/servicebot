import React from 'react';
import {Link, hashHistory} from 'react-router';
import _ from "lodash";
import $ from "jquery";
import '../../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';

class Dropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {dataObject: this.props.dataObject};

        this.processDropDownButtons = this.processDropDownButtons.bind(this);
        this.processLink = this.processLink.bind(this);
    }

    componentDidMount(){
        $(this.refs.dropdownToggle).dropdown();
    }

    processDropDownButtons(link, id){
        let myLink = _.isFunction(link) ? link(this.props.active) : link;

        if(myLink){
            // console.log(typeof myLink);
            let linkArray = myLink.split('/');
            if(linkArray.indexOf(':id') > -1){
                // console.log("found");
                linkArray[linkArray.indexOf(':id')] = id;
                let resultLink = linkArray.join('/');
                // console.log(resultLink);
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
            // console.log("the onclick function", myFunction);
            return(
              <Link to={this.processDropDownButtons(button.link, this.props.id)} onClick={myFunction(myData)}>
                  { _.isFunction(button.name) ? button.name(myData) : button.name }
              </Link>
            );
        }else{
            return(
                <Link to={this.processDropDownButtons(button.link, this.props.id)}>
                    { _.isFunction(button.name) ? button.name(this.props.active) : button.name }
                </Link>
            );
        }
    }

    render () {
        let self = this;
        return(
            <div id="action-buttons" className="btn-group">
                <button type="button" className="btn btn-default dropdown-toggle" ref="dropdownToggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.name} <span className="caret"/>
                </button>
                <ul className={`dropdown-menu ${this.props.direction ? (this.props.direction == 'right' ? 'dropdown-menu-right' : '') : ''}`}>
                    {this.props.dropdown.map(button => (
                        button.name == "divider" ? <li key={`${self.props.id}-separator`} role="separator" className="divider"/> :
                        <li key={`button-${button.id}-${self.props.id}`}>
                            {/*{console.log(`button-${button.id}`)}*/}
                            {this.processLink(button)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default Dropdown;
