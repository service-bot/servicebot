import React from 'react';
import Modal from '../../utilities/modal.jsx';
import SuspendUserForm from '../forms/suspend-user-form.jsx'

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalSuspendUser extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let self = this;
        let pageName = "Suspend User";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <SuspendUserForm uid={this.props.uid} hide={self.props.hide}/>
                </div>
            </Modal>
        );
    }
}

export default ModalSuspendUser;
