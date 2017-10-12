import React from 'react';
import Load from '../../utilities/load.jsx';
import Inputs from "../../utilities/inputs.jsx";
import {DataForm} from "../../utilities/data-form.jsx";
import Buttons from "../buttons.jsx";
import Alerts from "../alerts.jsx";
import {Price} from "../../utilities/price.jsx";
import DateFormat from "../../utilities/date-format.jsx";
import Fetcher from "../../utilities/fetcher.jsx";
let _ = require("lodash");

class RefundForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            invoice: this.props.invoice,
            refundURL: `/api/v1/invoices/${this.props.invoice.id}/refund`,
            invoice: {},
            loading: false,
            success: false,
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.fetchInvoice = this.fetchInvoice.bind(this);
    }

    componentDidMount(){
        this.fetchInvoice();
    }

    fetchInvoice(){
        Fetcher(`/invoices/${this.state.invoice.id}`).then(function (response) {
            if(!response.error){
                this.setState({loading: false, invoice: response});
            }else{
                console.error('error', response);
            }
        });
    }

    handleResponse(response){

        if(_.has(response,'data.status') && _.get(response, 'data.status') == "succeeded"){
            this.setState({
                success: true,
                response: response.data,
                alerts: {
                    type: 'success',
                    message: 'Refund succeeded!'
                }
            });
        }else{
            if(response.type == "StripeInvalidRequestError"){
                this.setState({alerts: {type: 'danger', message: response.message, icon: 'exclamation-circle'}});
            }else if(response.error){
                this.setState({alerts: {type: 'danger', message: response.error.message, icon: 'exclamation-circle'}});
            }else if(response == null){
                this.setState({alerts: {type: 'danger', message: 'Response is null', icon: 'exclamation-circle'}});
            }else{
                this.setState({alerts: {type: 'danger', message: 'Other error', icon: 'exclamation-circle'}});
            }
        }
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div>
                    <div className="p-20">
                        {this.state.alerts &&
                            <Alerts type={this.state.alerts.type} message={this.state.alerts.message}/>
                        }
                    </div>
                    <table className="table table-striped table-hover condensed">
                        <thead>
                            <tr>
                                <td>ID</td>
                                <td>Reason</td>
                                <td>Status</td>
                                <td>Date</td>
                                <td>Amount Refunded</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.response.refunds.data.map((item)=>
                                <tr key={`refund-id-${item.id}`}>
                                    <td>{item.id}</td>
                                    <td>{item.reason}</td>
                                    <td>{item.status}</td>
                                    <td><DateFormat time date={item.created}/></td>
                                    <td><Price value={item.amount}/></td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="invoice-footer">
                            <tr>
                                <td/><td/><td/>
                                <td>Total Refunded:</td>
                                <td><Price value={this.state.response.amount_refunded}/></td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className={`modal-footer text-right p-b-20`}>
                        <Buttons containerClass="inline" btnType="default" text="Done" onClick={this.props.hide} />
                    </div>
                </div>
            );
        }else{
            //TODO: Add validation functions and pass into DataForm as props
            return (
                <div className="refund-form">

                    {this.state.alerts &&
                        <div className="p-20">
                            <Alerts type={this.state.alerts.type} message={this.state.alerts.message}  icon={this.state.alerts.icon}/>
                        </div>
                    }

                    <DataForm handleResponse={this.handleResponse} url={this.state.refundURL} method={'POST'}>

                        <div className="p-20">
                            <p><strong>You can issue a partial or full refund. If you leave the amount 0 and submit, full refund will be applied.
                            Total amount of refunds cannot exceed the total transaction amount.</strong></p>
                            <Inputs type="price" name="amount" label="Refund Amount" defaultValue={0}
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                            <Inputs type="select" name="reason" label="What is the reason for this refund?" defaultValue="requested_by_customer"
                                    options={[
                                        {'Requested by customer': 'requested_by_customer'},
                                        {'Duplicate': 'duplicate'},
                                        {'Fraudulent': 'fraudulent'}
                                    ]}
                                    onChange={function(){}} receiveOnChange={true} receiveValue={true}/>
                        </div>

                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" type="submit" value="submit" text="Issue Refund" success={this.state.success}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={this.props.hide} />
                        </div>
                    </DataForm>
                </div>
            );
        }
    }
}

export default RefundForm;
