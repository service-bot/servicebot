//for all the functions with callbacks that don't follow function(error, result) format... (which unfortunately there are a bunch)

function promisifyHelper(resolve, reject){
    return function(err, result){
        if(err){
            return reject(err);
        }else{
            return resolve(result);
        }
    }
}

let promiseProxy = function(functionToProxy, firstResolve = true){
    return new Proxy(functionToProxy, {
        apply : function(target, thisArg, argumentList){
            if(target.length === argumentList.length){
                // console.log("FUNCTION IS CALLING!", functionToProxy);
                target.bind(thisArg)(...argumentList);
            }
            else{
                return new Promise((resolve, reject) => {
                    if(firstResolve) {
                        target.bind(thisArg)(...argumentList, resolve);
                    }else{
                        target.bind(thisArg)(...argumentList, promisifyHelper(resolve, reject));
                    }
                })
            }
        }
    })

};




module.exports = promiseProxy;