import React from 'react';
import Modal from '../../utilities/modal.jsx';
import DeleteCategoryForm from '../forms/delete-category-form.jsx';

/**
 * Uses Modal.jsx component to house the content of this modal
 * Calls
 */
class DeleteCategory extends React.Component {

    constructor(props){
        super(props);
    }


    render () {
        let self = this;
        let pageName = "Delete Category";

        return(
            <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                <div className="table-responsive">
                    <DeleteCategoryForm id={this.props.id} hide={self.props.hide}/>
                </div>
            </Modal>
        );
    }
}

export default DeleteCategory;
