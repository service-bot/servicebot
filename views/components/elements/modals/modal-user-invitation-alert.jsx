import React from 'react';
import Modal from '../../utilities/modal.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalUserInvitaionAlert extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            email: this.props.email || null
        }
    }


    render () {
        let self = this;
        let pageName = "Email Confirmation Needed";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true} width={this.props.width}>
                <div className="table-responsive">
                    <h3>Please confirm your email.</h3>
                    <p>Please check your email and click on the link provided to set your password.</p>
                </div>
            </Modal>
        );
    }
}

export default ModalUserInvitaionAlert;
