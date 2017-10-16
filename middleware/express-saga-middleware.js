let {eventChannel, END} = require("redux-saga");
let {take, fork, spawn} = require("redux-saga/effects");


function* reqSaga(requestChannel, sagaMiddleware){
    while(true){
        console.log("WAITIN FOR THE REQUESZTS!");
        let {req, res, next} = yield take(requestChannel);
        console.log("GOTTA REQUEST!");
        yield fork(sagaMiddleware, req, res, next);

    }
}
/**
 *
 * @param saga - saga that takes in req res next params
 */
//todo: need promise support to resolve at correct time...
module.exports = function*(saga){
    const channel = eventChannel(emitter => {
        let middleware = function(req, res, next){
            emitter({req, res, next});
        };
        setTimeout(emitter, 500, middleware);
        return () => {
            console.error("unsubscribe...")
        }
    });
    let middleware = yield take(channel);
    let requestHandler = yield spawn(reqSaga, channel, saga);
    return middleware;
}



