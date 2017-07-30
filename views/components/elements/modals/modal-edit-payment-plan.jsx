import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import ServiceInstancePaymentFormEdit from '../forms/service-instance-payment-form-edit.jsx'
import Modal from '../../utilities/modal.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalEditPaymentPlan extends React.Component {

    constructor(props){
        super(props);
        let instance = this.props.myInstance;
        this.state = {instance: instance};
    }


    render () {
        let self = this;
        let pageName = "Edit Payment Plan";

        return(
            <Modal modalTitle={pageName} icon="fa-credit-card-alt" hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <div className="row">
                        <div className="col-xs-12">
                            <ServiceInstancePaymentFormEdit myInstance={self.state.instance} onHide={self.props.hide}/>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalEditPaymentPlan;
