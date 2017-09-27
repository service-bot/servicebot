//for all the functions with callbacks that don't follow function(error, result) format... (which unfortunately there are a bunch)


let promiseProxy = function(functionToProxy){
    return new Proxy(functionToProxy, {
        apply : function(target, thisArg, argumentList){
            if(typeof argumentList[argumentList.length - 1] === "function"){
                target(...argumentList);
            }
            else{
                return new Promise((resolve) => {
                    target(...argumentList, resolve);
                })
            }
        }
    })

}

module.exports = promiseProxy;