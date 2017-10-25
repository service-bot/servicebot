import React from 'react';
import {Link, browserHistory} from 'react-router';
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Dropdown from "../elements/dropdown.jsx"
import DateFormat from "../utilities/date-format.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class DashboardCancellationRequests extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };

        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    /**
     * Fetches Table Data
     * Sets the state with the fetched data for use in ServiceBotTableBase's props.row
     */
    fetchData() {
        let self = this;

        Fetcher('/api/v1/service-instances/search?key=status&value=waiting_cancellation').then(function (response) {
            if (!response.error) {
                self.setState({rows: response});
            }
            self.setState({loading: false});
        });
    }

    /**
     * Cell formatters
     * Formats each cell data by passing the function as the dataFormat prop in TableHeaderColumn
     */
    userIdFormatter(cell, row){
        return (
            <div className="badge badge-xs">
                <Link className="customer-column" to={`/manage-users/${cell}`}>
                    <img className="customer-image img-circle" src={`/api/v1/users/${cell}/avatar`}/>
                    <span className="customer-name">{row.references.users[0].name}</span>
                </Link>
            </div>
        );
    }
    nameFormatter(cell, row){
        return ( <Link to={`/service-instance/${row.id}`}>{cell}</Link> );
    }
    createdFormatter(cell){
        return ( <DateFormat date={cell} time/> );
    }
    rowActionsFormatter(cell, row){
        return (
            <Dropdown
                direction="right"
                dropdown={[
                    {   type: "button",
                        label: 'View',
                        action: () => { browserHistory.push(`/service-instance/${row.id}`) }
                    },
                    {   type: "button",
                        label: 'View User Invoice',
                        action: () => { browserHistory.push(`/billing-history/${row.user_id}`) }
                    },
                ]}
            />
        );
    }

    render () {
        if(this.state.loading){
            return ( <Load/> );
        }else {
            return (
                <ServiceBotTableBase
                    noDataText='Great! There are no pending cancellation requests!'
                    rows={this.state.rows}
                    fetchRows={this.fetchData}>
                    <TableHeaderColumn isKey
                                       dataField='user_id'
                                       dataFormat={this.userIdFormatter}
                                       dataSort={ false }
                                       searchable={false}
                                       width='30'
                                       filter={false}/>
                    <TableHeaderColumn dataField='name'
                                       dataFormat={this.nameFormatter}
                                       dataSort={ true }
                                       width='200'>
                        Product / Service Name
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField='created_at'
                                       dataFormat={this.createdFormatter}
                                       dataSort={ true }
                                       width='80'>
                        Created On
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField='Actions'
                                       className={'action-column-header'}
                                       columnClassName={'action-column'}
                                       dataFormat={ this.rowActionsFormatter }
                                       searchable={false}
                                       width='80'
                                       filter={false}>
                    </TableHeaderColumn>
                </ServiceBotTableBase>
            );
        }
    }
}

export default DashboardCancellationRequests;
