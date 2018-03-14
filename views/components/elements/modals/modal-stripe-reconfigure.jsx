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

        let formData = {};
        if(self.props.formData) {
            formData = JSON.parse(self.props.formData).form;
        }
        console.log("SHARRRRR")
        console.log(formData)

        return(
            <Modal modalTitle={pageName} hide={self.props.hide} hideFooter={true} titleColor="modal-danger" top="40%" width="650px">
                <div className="table-responsive">
                    <div className="p-20">
                        <div className="row">
                            <div className="col-xs-12">
                                <p><strong>Are you sure you want to change the Stripe API keys?</strong></p>
                                {(formData && formData.full_removal) ?
                                    <p>Your customers, subscriptions, and invoices will be deleted from your old Stripe account. The action is reversable.</p>
                                    :
                                    <p>Your customers, subscriptions, and invoices will remain active on your old Stripe account.</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div className={`modal-footer text-right p-b-20`}>
                        <Buttons containerClass="inline" btnType="danger" text="Confirm Change" onClick={self.props.confirm} />
                        <Buttons containerClass="inline" btnType="default" text="Cancel" onClick={self.props.hide} />
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ModalConfirm;
