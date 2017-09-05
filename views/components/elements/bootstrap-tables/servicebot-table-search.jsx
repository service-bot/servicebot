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
            <div>
                <div className='input-group servicebot-search-btns'>
                    { this.props.searchField }
                    <span className="input-group-btn">
                        { this.props.clearBtn }
                        <button
                            className='btn btn-default'
                            type='button'
                            onClick={ this.toggleAdvanced }>
                            Advanced Search
                        </button>
                    </span>
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
                className="form-control servicebot-search-input"
                type='text'
                defaultValue={ this.props.defaultValue }
                placeholder={ this.props.placeholder || "Search"}
                onKeyUp={ this.props.search }
            />
        );
    }

}


export {ServiceBotTableSearch, ServiceBotSearchField};