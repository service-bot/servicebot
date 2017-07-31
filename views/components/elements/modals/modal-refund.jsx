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
        let self = this;
        let pageName = "Issue Refund";

        return(
            <Modal modalTitle={pageName} icon="fa-money" hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <RefundForm hide={self.props.hide} invoice={this.props.invoice}/>
                </div>
            </Modal>
        );
    }
}

export default ModalRefund;
