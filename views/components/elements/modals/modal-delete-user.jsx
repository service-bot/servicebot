import React from 'react';
import Modal from '../../utilities/modal.jsx';
import DeleteUserForm from '../forms/delete-user-form.jsx'

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class DeleteUser extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let self = this;
        let pageName = "Delete User";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <DeleteUserForm uid={this.props.uid} hide={self.props.hide}/>
                </div>
            </Modal>
        );
    }
}

export default DeleteUser;
