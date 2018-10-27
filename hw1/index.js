/*
*
* Title: My Homework Assignment #1
* Description: Responding to Posts on hello path
* Author: David Ibañez
* Date: 27/10/2018
*
 */

var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res){

    // Gather all the necessary data from the req object
    var req_data = gatherAllRequestData(req);

    // Declare the string decoder
    var StringDecoder = require('string_decoder').StringDecoder;

    // Declare the decoder
    var decoder = new StringDecoder('utf-8');

    // Initialize the buffer
    var buffer = '';

    // Check if handler exists and set as the function to execute, if not exists set the default not found
    // We also check the method.
    var requestedHandler = (typeof(router[req_data.url_path]) !== 'undefined'
                        && typeof(router[req_data.url_path][req_data.method]) !== 'undefined')
                        ? router[req_data.url_path][req_data.method] : handlers.notFound;


    // Read the stream and write to the buffer on data
    req.on('data', function(data){
        // Write the buffer with received data
        buffer += decoder.write(data);
    });

    // At the end of the stream we close the buffer
    req.on('end', function(){
        // Write the last information in the buffer
        buffer += decoder.end();

        // Add the buffer to the request data object
        req_data.payload = buffer;

        // Process the handler requested
        requestedHandler(req_data,function(status_code,payload){

            // Set the status code provided or default and the payload or empty object if not provided
            status_code = typeof(status_code) === 'number' ? status_code : 200;
            payload = typeof(payload) === 'object'? payload : {};

            // Convert the payload to a string
            var str_payload = JSON.stringify(payload);

            // Configure the response
            res.setHeader('Content-Type', 'application/json');

            //Write the header
            res.writeHead(status_code);

            // End the response
            res.end(str_payload);
        });
    });
});

server.listen(3000, function(){
    console.log("Running server on port 3000");
});

var gatherAllRequestData = function(req){

    // Get the parsed URL and setting to use querystring module
    var parsed_url = url.parse(req.url, true);

    // Get the path
    var url_path = parsed_url.pathname.replace(/^\/+|\/+$/g, '');

    // Get the querystring
    var query = parsed_url.query;

    // Get the method
    var method = req.method.toLocaleUpperCase();

    // Get the headers
    var headers = req.headers;

    // Returning the data
    return {
        url_path : url_path,
        query : query,
        method : method,
        headers : headers
    }
};

// Preparing the handlers
var handlers = {};

// define handler for hello path based on methods
handlers.hello ={
    'POST' : function(data, callback) {
        // set the response to the post if it is a post.
        callback(200, { message : 'Hi, Welcome!', your_request : data.payload});
    }
};

// Not-Found handler
handlers.notFound = function(data,callback){
    callback(404);
};

// Define the request router
var router = {
    'hello' : handlers.hello
};