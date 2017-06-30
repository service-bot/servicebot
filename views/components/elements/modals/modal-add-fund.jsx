import React from 'react';
import Modal from '../../utilities/modal.jsx';
import BillingSettingsForm from '../forms/billing-settings-form.jsx';

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

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <div className="p-20">
                        <BillingSettingsForm forUID={this.props.uid} user={this.props.user}/>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalAddFund;
