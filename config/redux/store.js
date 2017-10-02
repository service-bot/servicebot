

let { triggerEvent}  =  require("./actions");

class Store{
    constructor(){
    }
    setStore(store){
      this.store = store;
    }
    getState(){
        return this.store.getState().servicebot;
    }
    dispatchEvent(eventName, eventObject){
        return this.store.dispatch(triggerEvent(eventName, eventObject));

    };
}

module.exports = new Store();