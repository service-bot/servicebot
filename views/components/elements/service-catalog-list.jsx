import React from 'react';
import Tabs from "./tab/tabs.jsx";

class ServiceCatalogList extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return (
            <div className="col-md-12">
                <Tabs tabUrl={`/api/v1/service-categories`}
                      contentUrl={`/api/v1/service-templates?key=category_id&value=`}
                      imgUrl={`/api/v1/service-templates`}/>
            </div>
        );
    }

}

export default ServiceCatalogList;
