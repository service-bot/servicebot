import React from 'react';
import cookie from 'react-cookie';
import Modal from '../../utilities/modal.jsx';
import {BillingForm} from '../forms/billing-settings-form.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalAddFund extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        let self = this;
        let pageName = "Add Credit Card For User";
        let spk = cookie.load("spk");
        return(
            <Modal modalTitle={pageName} icon="fa-credit-card-alt" hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <BillingForm uid={this.props.uid} user={this.props.user} spk={spk}/>
                        </div>
                    </div>
            </Modal>
        );
    }
}

export default ModalAddFund;
