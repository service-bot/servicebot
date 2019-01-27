import React from 'react';
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';

class Dropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            opened: false
        };

        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.getButton = this.getButton.bind(this);
    }

    toggleDropDown(){
        this.setState({opened: !this.state.opened});
    }

    getButton(item, index){

        if(item.type == "divider"){
            return (
                <li tabIndex={-1} key={`item-${index}`} role="separator" className="divider"/>
            )
        }else if(item.type == "button"){
            return (
                <li key={`item-${index}`} >
                    <a role="button" tabIndex={0} onClick={item.action}>{item.label}</a>
                </li>
            )
        }else if(item.type == "link"){
            return (
                <li key={`item-${index}`} >
                    <a role="button" tabIndex={0} href={item.action}>{item.label}</a>
                </li>
            )
        }
    }

    render() {
        let { dropdown, direction } = this.props;
        let { opened } = this.state;
        return (
            <div className={`action-dropdown ${opened ? 'open' : 'closed'}`}>
                <button className="buttons _default _navy _dropdown-toggle" type="button" id="dropdownMenuButton"
                        aria-haspopup="true" aria-expanded="false" onClick={this.toggleDropDown}>
                    Actions
                </button>
                <ul className={`dropdown-menu ${direction ? (direction === 'right' ? 'dropdown-menu-right' : '') : ''}`}>
                    {dropdown.map((item, index) =>
                        this.getButton(item, index)
                    )}
                </ul>
                <div className={`__close`} onClick={this.toggleDropDown}/>
            </div>
        );
    }
}

export default Dropdown;
