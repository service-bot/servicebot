import React from 'react';
import Modal from '../../utilities/modal.jsx';
import RefundForm from '../forms/refund-form.jsx'

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalRefund extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let { invoice, show, hide } = this.props;

        return(
            <Modal className={`__invoice`}
                   modalTitle={`Issue Refund`}
                   icon="fa-money"
                   show={show}
                   hide={hide}
                   hideCloseBtn={true}
                   hideFooter={true}>
                <div className="table-responsive">
                    <RefundForm hide={hide} invoice={invoice}/>
                </div>
            </Modal>
        );
    }
}

export default ModalRefund;
