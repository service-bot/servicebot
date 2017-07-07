import React from 'react';
import Modal from '../../utilities/modal.jsx';
import UserFormEditRole from '../forms/user-form-edit-role.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalEditUserRole extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let self = this;
        let pageName = `Edit User Role`;

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <div className="row">
                        <div className="col-xs-12">
                            <UserFormEditRole user={this.props.user} hide={this.props.hide}/>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalEditUserRole;
