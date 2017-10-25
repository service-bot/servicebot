var waitForPort = require('wait-for-port');
waitForPort(process.argv[2], process.argv[3], { numRetries: 3, retryInterval: 10000 }, function(err) {
    if (err) throw new Error(err);
    console.log("HOST DETECTED ON PORT " + process.argv[3])
});