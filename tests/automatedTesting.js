var http = require('http');
var request = require('request');
var FormData = require('form-data');

var form = new FormData();
form.append('email', 'admin');
form.append('password', '1234');
form.submit('http://localhost:3000/user/login', function(err, res) {
    // res – response object (http.IncomingMessage)  //
    console.log(res.statusCode + " : " + res.statusMessage)
    var headers = res['headers'];
    var cookie = res.headers['set-cookie'][0];
    console.log("tootie: " + typeof cookie)
    res.resume();
    request({
        url: "http://localhost:3000/service-instance/1",
        method: "GET",
        headers: {'Cookie': cookie},
        //json: true,   // <--Very important!!!
        //body: myJSONObject
    }, function (error, response, body){
        console.log(response);
        console.log("body: " + body)
    });
});


/*
request({
    url: "http://localhost:3000/service-instance/1/edit",
    method: "POST",
    json: true,   // <--Very important!!!
    body: myJSONObject
}, function (error, response, body){
    console.log(response);
});*/

/*
var loginJSON = {
    "email": "admin",
    "password": "1234"
}
request({
    url: "http://localhost:3000/user/login",
    method: "POST",
    json: true,   // <--Very important!!!
    body: loginJSON
}, function (error, response, body){
    //console.log(response);
    console.log("body: " + body)
});
request({
    url: "http://localhost:3000/service-instance/1",
    method: "GET",
    //json: true,   // <--Very important!!!
    //body: myJSONObject
}, function (error, response, body){
    //console.log(response);
    console.log("body: " + body)
});

*/
/*
var post_data = querystring.stringify({
    'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
    'output_format': 'json',
    'output_info': 'compiled_code',
    'warning_level' : 'QUIET',
    'js_code' : codestring
});

var options = {
    host: 'localhost',
    path: '/',
    port: '3000',
    method: 'POST'
    //This is the only line that is new. `headers` is an object with the headers to request
    //headers: {'custom': 'Custom Header Demo works'}
};

callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        console.log(str);
    });
}

var req = http.request(options, callback);
req.end();
    */