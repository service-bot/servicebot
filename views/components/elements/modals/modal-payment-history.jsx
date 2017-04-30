import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls payment history api to render content
 */
class ModalPaymentHistory extends React.Component {

    constructor(props){
        super(props);
        this.state = {url: '', paymentHistory: false}
    }


    render () {
        let self = this;
        let pageName = "Payment History";

        return(
            <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide}>
                <div className="table-responsive">
                    <div className="p-20">
                        <div className="row">
                            <div className="col-xs-12">
                                <p>Showing your payment history</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalPaymentHistory;
