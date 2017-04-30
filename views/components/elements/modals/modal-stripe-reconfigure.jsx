import React from 'react';
import Modal from '../../utilities/modal.jsx';
import Buttons from '../buttons.jsx';
let _ = require("lodash");

class ModalConfirm extends React.Component {

    constructor(props){
        super(props);
        this.state = {  loading: false,
                        ajaxLoad: false,
                    };
    }

    componentWillMount(){

    }

    render () {
        let self = this;
        let pageName = "Confirm Stripe API Key Change";

        return(
            <Modal modalTitle={pageName} hide={self.props.hide} hideFooter={true} titleColor="modal-danger" top="40%" width="650px">
                <div className="table-responsive">
                    <div className="p-20">
                        <div className="row">
                            <div className="col-xs-12">
                                <p><strong>Are you sure you want to change the Stripe API keys?</strong></p>
                                <p>Changing these keys will have severe impact on your current data. This warning is to
                                    inform you that you requested Stripe keys are either from a different account, or
                                    different environments. If you confirm, ServiceBot will remove all user provisioned
                                    data and create all your customers on the new Stripe account/environment.</p>
                            </div>
                        </div>
                    </div>
                    <div className={`modal-footer text-right p-b-20`}>
                        <Buttons containerClass="inline" btnType="danger" text="Confirm Migration" onClick={self.props.confirm} />
                        <Buttons containerClass="inline" btnType="default" text="Cancel" onClick={self.props.hide} />
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalConfirm;
