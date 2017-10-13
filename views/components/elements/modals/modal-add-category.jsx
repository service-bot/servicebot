import React from 'react';
import Modal from '../../utilities/modal.jsx';
import AddCategoryFormv2 from '../forms/add-category-form-v2.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class ModalAddCategory extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        let self = this;
        let pageName = "Add a Product / Service Category";
        if(this.props.id){
            pageName = "Edit a Product / Service Category";
        }

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <AddCategoryFormv2 hide={self.props.hide} categoryId={this.props.id}/>
                </div>
            </Modal>
        );
    }
}

export default ModalAddCategory;
