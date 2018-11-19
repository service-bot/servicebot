import React from 'react';
import ReactDOM from 'react-dom';

class ServiceBotTableSearch extends React.Component {

    constructor(props) {

        super(props);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
    }

    toggleAdvanced() {
        if (this.props.toggleAdvanced) {
            this.props.toggleAdvanced();
        }
    }

    render() {
        return (
            <div className='sb-form-group __base-table-search-bar'>
                { this.props.searchField }
                <div className="buttons-group">
                    { this.props.clearbuttons }
                    <button className='buttons _primary _navy' type='button' onClick={ this.toggleAdvanced }>Advanced Search</button>
                </div>
            </div>
        );
    }
}

class ServiceBotSearchField extends React.Component {

    constructor(props) {

        super(props);
        this.getValue = this.getValue.bind(this);
        this.setValue = this.setValue.bind(this);

    }

    // It's necessary to implement getValue
    getValue() {
        return ReactDOM.findDOMNode(this).value;
    }

    // It's necessary to implement setValue
    setValue(value) {
        ReactDOM.findDOMNode(this).value = value;
    }

    render() {
        return (
            <input
                className="_input- servicebot-search-input"
                type='text'
                defaultValue={ this.props.defaultValue }
                placeholder={ this.props.placeholder || "Search"}
                onKeyUp={ this.props.search }
            />
        );
    }

}


export {ServiceBotTableSearch, ServiceBotSearchField};