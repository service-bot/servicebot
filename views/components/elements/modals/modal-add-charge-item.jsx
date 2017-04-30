import React from 'react';
import ServiceInstanceAddChargeItem from '../forms/service-instance-add-charge-item.jsx';
import Modal from '../../utilities/modal.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalAddChargeItem extends React.Component {

    constructor(props){
        super(props);
        let instance = this.props.myInstance;
        this.state = {instance: instance};
    }


    render () {
        let self = this;
        let pageName = "Add A Line Item";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <div className="row">
                        <div className="col-xs-12">
                            <ServiceInstanceAddChargeItem myInstance={self.state.instance} onHide={self.props.hide}/>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalAddChargeItem;
