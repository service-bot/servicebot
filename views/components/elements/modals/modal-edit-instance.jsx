import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import ServiceInstanceFormEdit from '../forms/service-instance-form-edit.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalEditInstance extends React.Component {

    constructor(props){
        super(props);
        this.state = {instance: this.props.myInstance}
    }


    render () {
        let self = this;
        let pageName = "Edit Service Instance";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <div className="row">
                        <div className="col-xs-12">
                            <ServiceInstanceFormEdit myInstance={self.state.instance} templateId={self.state.instance.service_id} onHide={self.props.hide}/>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalEditInstance;
