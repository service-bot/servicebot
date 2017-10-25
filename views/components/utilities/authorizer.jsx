import React from 'react';
import { connect } from "react-redux";
//TODO : Consider server side, there are implications handling this auth client side, possible attack vector, APIs should block attacker from getting any useful data
import {DELETETHISCODELATERUID} from "../../store";


let isAuthorized = function(props) {
    //check if logged in
    if( DELETETHISCODELATERUID  && localStorage.getItem("permissions")) {

        if(props.anonymous){
            return false;
        }
        let user_perms = localStorage.getItem("permissions");
        // let user_perms = JSON.parse((cookie.load("permissions").slice(2)));

        let required_perms = props.permissions ? props.permissions : [];

        if(typeof required_perms == "string"){
            required_perms = [required_perms];
        }


        if(required_perms.every(permission => user_perms.includes(permission)) || user_perms.includes("can_administrate") || user_perms.includes("can_manage")){
            //renders inner content if authorized
            return true;
        }
        else{
        }

        //logic goes here for unauthorized component
        return false;
    }
    else{

        if(props.anonymous){
            return true;
        }

        //logic goes here for logged out
        return false;
    }

};
/**
 *
 * @param props.permissions - expects props.permissions to contain either an array of permission strings or a single permission string
 * @param props.anonymous - if true then the authorizer will consider a logged out user to be authorized to view component
 * @param props.handleUnauthorized - optional callback function which will get called if the user is unauthorized
 * @returns {Children nested within the authorizor} or Null if unauthorized
 * @constructor
 */
let Authorizer = function(props) {
    //check if logged in
    if(props.uid && localStorage.getItem("permissions")) {

        if(props.anonymous){
            if(props.handleUnauthorized){
                props.handleUnauthorized();
            }
            return null;
        }
        let user_perms = localStorage.getItem("permissions");
        // let user_perms = JSON.parse((cookie.load("permissions").slice(2)));

        let required_perms = props.permissions ? props.permissions : [];
        if(typeof required_perms == "string"){
            required_perms = [required_perms];
        }


        if(required_perms.every(permission => user_perms.includes(permission)) || user_perms.includes("can_administrate") || user_perms.includes("can_manage")){
            //renders inner content if authorized
            if(Array.isArray(props.children)){
                return (<span>{props.children}</span>);
            }
            return props.children;
        }
        else{
            if(props.handleUnauthorized){
                props.handleUnauthorized();
            }

            //logic goes here for unauthorized component
            return null;
        }
    }
    else{
        if(props.anonymous){
            if(Array.isArray(props.children)){
                return (<span>{props.children}</span>);
            }
            return props.children;
        }
        if(props.handleUnauthorized){
            props.handleUnauthorized();
        }

        //logic goes here for logged out
        return null;
    }

};
const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};




Authorizer = connect(mapStateToProps)(Authorizer);

export {Authorizer, isAuthorized};
export default Authorizer;