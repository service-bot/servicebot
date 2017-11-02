import React from 'react';
import ReactDOM from 'react-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {ServiceBotTableSearch, ServiceBotSearchField} from './servicebot-table-search.jsx';
import './css/style.css';

class ServiceBotTableBase extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            advancedFilter: null,
        };

        this.toggleColumnFilter = this.toggleColumnFilter.bind(this);
        this.renderCustomButtonGroup = this.renderCustomButtonGroup.bind(this);
        this.customColumns = this.customColumns.bind(this);
        this.onAfterInsertRow = this.onAfterInsertRow.bind(this);
    }

    toggleColumnFilter() {

        const advancedFilterSetting = {type: 'TextFilter', delay: 100};
        if (this.state.advancedFilter == null) {
            this.setState({advancedFilter: advancedFilterSetting});
        } else {
            this.setState({advancedFilter: null});
        }

    }

    renderCustomClearSearchBtn(onClick) {
        return (
            <button className='btn btn-default' onClick={ onClick }>Clear Search</button>
        );
    };

    renderExportCSVButton(onClick) {
        return (
            <button className='btn btn-default' onClick={ onClick }>Export</button>
        );
    }

    renderCustomButtonGroup(props) {
        let self = this;
        return (
            <ButtonGroup className='servicebot-table-btn-group' sizeClass='btn-group-md'>
                {self.props.createItemAction &&
                <button {...self.props.createItemProps} type='button' className={ `btn btn-default` } onClick={() => {
                    self.props.createItemAction ? self.props.createItemAction() :
                        console.error('You must pass a prop "createItem" to ServiceBotTableBase component.');
                }}><i className="fa fa-plus"/> {self.props.createItemLabel}
                </button>
                }
                { props.showSelectedOnlyBtn }
                { props.exportCSVBtn }
                { props.insertBtn }
                { props.deleteBtn }
            </ButtonGroup>
        )
    };

    renderSizePerPageDropDown(props) {
        return (
            <div className='btn-group'>
                {
                    [25, 50, 100].map((n, idx) => {
                        const isActive = (n === props.currSizePerPage) ? 'active' : null;
                        return (
                            <button key={ idx } type='button' className={ `btn btn-default ${isActive}` }
                                    onClick={ () => props.changeSizePerPage(n) }>{ n }</button>
                        );
                    })
                }
            </div>
        );
    };

    onAfterInsertRow(row) {
        this.props.fetchRows();
        alert('This will call an API to insert a row into the database');
    }

    onAfterDeleteRow(rowKeys) {
        alert('The rowkey you drop: ' + rowKeys);
    }

    customConfirmDeleteRow(next, dropRowKeys) {
        const dropRowKeysStr = dropRowKeys.join(',');
        if (confirm(`Are you sure you want to delete ${dropRowKeysStr}?`)) {
            // If the confirmation is true, call the function that
            // continues the deletion of the record.
            next();
        }
    }

    customColumns(children) {
        let self = this;

        const customChildren = React.Children.map(children,
            (child) => {

                let props = (child.props.searchable && self.state.advancedFilter) ? {filter : (child.props.filter || self.state.advancedFilter)} : {filter :false};
                return React.cloneElement(child, props);
        }
        );

        return customChildren;
    }

    render() {

        let {noDataText, children, rows, onAfterInsertRow, deleteRow, onAfterDeleteRow, customConfirmDeleteRow, clearSearch} = this.props;

        const options = {
            noDataText: noDataText || 'No Data To Display',
            afterInsertRow: onAfterInsertRow || this.onAfterInsertRow,   // A hook for after insert rows
            afterDeleteRow: onAfterDeleteRow || this.onAfterDeleteRow,
            handleConfirmDeleteRow: customConfirmDeleteRow || this.customConfirmDeleteRow,
            clearSearch: clearSearch || true,
            btnGroup: this.renderCustomButtonGroup,
            clearSearchBtn: this.renderCustomClearSearchBtn,
            searchPanel: (props) => (<ServiceBotTableSearch { ...props } toggleAdvanced={this.toggleColumnFilter}/>),
            searchField: (props) => (<ServiceBotSearchField { ...props }/>),
            exportCSVBtn: this.renderExportCSVButton,
            sizePerPageDropDown: this.renderSizePerPageDropDown,
            sizePerPage: 50,
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last',
            defaultSortName: this.props.sortColumn,
            defaultSortOrder: this.props.sortOrder
        };

        return (
            <div className="servicebot-table-base">
                <BootstrapTable data={rows}
                                deleteRow={ deleteRow }
                                // selectRow={ false }
                                exportCSV={ true }
                                search={ true }
                                multiColumnSearch={true}
                                striped
                                hover
                                pagination
                                options={ options }
                >
                    {this.customColumns(children)}
                </BootstrapTable>
            </div>
        )
    }

}

export {ServiceBotTableBase}