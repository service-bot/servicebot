import React from 'react';
import Modal from '../../utilities/modal.jsx';
import Login from '../forms/login.jsx'
import {Link, browserHistory} from 'react-router';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalAddCategory extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            email: this.props.email || null
        };

    }

    render () {
        let self = this;
        let pageName = "User Login";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={this.props.hide} hideFooter={true} width={this.props.width}>
                <div className="table-responsive">
                    <Login hide={self.props.hide} email={this.state.email} invitationExists={this.props.invitationExists} modal={true}/>
                </div>
            </Modal>
        );
    }
}

export default ModalAddCategory;
