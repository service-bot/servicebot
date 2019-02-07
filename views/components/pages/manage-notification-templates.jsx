import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import Dropdown from "../elements/dropdown.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';

class ManageNotificationTemplates extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };
    }

    componentDidMount() {
        if (!isAuthorized({permissions: "can_administrate"})) {
            return browserHistory.push("/login");
        }
        this.fetchData();
    }

    /**
     * Fetches Table Data
     * Sets the state with the fetched data for use in ServiceBotTableBase's props.row
     */
    fetchData() {
        let self = this;

        Fetcher('/api/v1/notification-templates').then(function (response) {
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
    subjectFormatter(cell, row){
        return( <Link to={`/notification-templates/${row.id}`}>{cell}</Link>);
    }
    createdAtFormatter(cell){
        return (<DateFormat date={cell} time/>)
    }
    updatedAtFormatter(cell){
        return (<DateFormat date={cell} time/>)
    }
    sendEmailFormatter(data, row){
        return data ? <span className="status-badge green">Enabled</span> : <span className="status-badge gray">Disabled</span>
    }
    rowActionsFormatter(cell, row){
        return (
            <Dropdown
                direction="right"
                dropdown={[
                    {   type: "button",
                        label: 'Edit Template',
                        action: () => { browserHistory.push(`/notification-templates/${row.id}`) }
                    },
                ]}
            />
        );
    }

    render () {
        if( this.state.loading ){
            return ( <Load/> );
        }else {
            return (
                <Authorizer permissions="can_administrate">
                    <div className="page __manage-notification-templates">
                        <Content>
                            <ContentTitle title="Manage Notification Templates"/>
                            <ServiceBotTableBase
                                rows={this.state.rows}
                                fetchRows={this.fetchData}
                            >
                                <TableHeaderColumn isKey
                                                    dataField='subject'
                                                   dataFormat={this.subjectFormatter}
                                                   dataSort={ true }
                                                   width='250'>
                                    Subject
                                </TableHeaderColumn>
                                <TableHeaderColumn dataField='description'
                                                   dataSort={ true }
                                                   width='350'>
                                    Description
                                </TableHeaderColumn>
                                <TableHeaderColumn dataField='send_email'
                                                   dataFormat={this.sendEmailFormatter}
                                                   dataSort={ true }
                                                   searchable={false}
                                                   width='150'>
                                    Send Email
                                </TableHeaderColumn>
                                <TableHeaderColumn dataField='updated_at'
                                                   dataFormat={this.updatedAtFormatter}
                                                   dataSort={ true }
                                                   searchable={false}
                                                   width='150'>
                                    Updated At
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
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default ManageNotificationTemplates;
