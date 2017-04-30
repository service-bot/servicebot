import React from 'react';
import {Link} from 'react-router';

let CleanBreadcrumb = function (breadcrumb){
    let cleaned = _.replace(breadcrumb, /[-_]/g, ' ');
    let capitalized = _.capitalize(cleaned);
    return capitalized;
}

let CleanBreadcrumbLink = function (link) {
    let newLink = link;
    if(newLink.charAt(newLink.length-1) == '/'){
        newLink = newLink.substr(0, newLink.length-1);
    }
    return newLink;
}

let breadcrumbs = function (props) {

    let path = props.location.pathname;

    let pathArray = path.split('/');

    if(pathArray.length){
        if(pathArray.length == 2 && pathArray[1] == ''){
            return(
                <li>
                    <Link to="/">Home</Link>
                </li>
            );
        }else if(pathArray.length >= 2){
            let breadcrumbLink = '';
            let count = 0;
            return(
                <ol className="breadcrumb icon-home icon-angle-right no-bg">
                    {pathArray.map((breadcrumb)=>
                        <li data={breadcrumbLink = breadcrumbLink + breadcrumb + '/'}
                            key={`breadcrumb-${breadcrumb}-${count++}`}>
                            {breadcrumb == '' ?
                                count == 1 && <Link to="/">Home</Link> :
                                count+1 == pathArray.length ?
                                <Link to={CleanBreadcrumbLink(breadcrumbLink)}>{CleanBreadcrumb(breadcrumb)}</Link> : <span>{CleanBreadcrumb(breadcrumb)}</span>
                            }
                        </li>
                    )}
                </ol>
            );
        }else{
            return(
                <li>
                    <Link to="/">Home</Link>
                </li>
            );
        }
    }
};

export default breadcrumbs