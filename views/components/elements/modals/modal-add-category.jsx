import React from 'react';
import Modal from '../../utilities/modal.jsx';
import AddCategoryForm from '../forms/add-category-form.jsx';
import EditCategoryForm from '../forms/edit-category-form.jsx';

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
        let pageName = "Add a Service Category";
        if(this.props.id){
            return(
                <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                    <div className="table-responsive">
                        <EditCategoryForm id={this.props.id} hide={self.props.hide}/>
                    </div>
                </Modal>
            );
        }
        else{
            return(
                <Modal modalTitle={pageName} hideCloseBtn={true} show={self.props.show} hide={self.props.hide} hideFooter={true}>
                    <div className="table-responsive">
                        <AddCategoryForm hide={self.props.hide}/>
                    </div>
                </Modal>
            );
        }
    }
}

export default ModalAddCategory;
