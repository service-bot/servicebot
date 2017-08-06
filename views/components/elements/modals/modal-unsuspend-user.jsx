import React from 'react';
import Modal from '../../utilities/modal.jsx';
import UnsuspendUserForm from '../forms/unsuspend-user-form.jsx'

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalUnsuspendUser extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let self = this;
        let pageName = "Activate User";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <UnsuspendUserForm uid={this.props.uid} hide={self.props.hide}/>
                </div>
            </Modal>
        );
    }
}

export default ModalUnsuspendUser;
