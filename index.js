var net = require("net");
var request = require('superagent');

var proxyUrl = "http://127.0.0.1:3128";

var debugfunc = function(name) {
    return function() {
        console.log("Amount of arguments for " + name + ": " + arguments.length);
    };
};

module.exports = function(serverHost, serverPort, port) {
    var server = net.createServer( function(socket) {
        socket.on('connect', debugfunc('connect'));
        socket.on('close', function(arg1) {
            console.log(arg1);
        });
        socket.on('data', function(data) {
            var message = {
                type: 'data',
                host: 'test.carlosborg.es',
                port: '80',
                content: data.toString('base64')
            }

            request.post("http://" + serverHost + ":" + serverPort)
                .proxy(proxyUrl)
                .send(message)
                .end(function(err, res) {
                    if (err) {
                        socket.end('ERROR: Proxy failed');
                    }
                    var response = JSON.parse(res.text);
                    console.log(res.text);
                    console.log(new Buffer(response.content, 'base64').toString('ascii'));
                    socket.write(response.content.toString('ascii'));
                });
        });
        socket.on('drain', debugfunc('drain'));
        socket.on('end', debugfunc('end'));
        socket.on('error', debugfunc('error'));
        socket.on('lookup', debugfunc('lookup'));
        socket.on('timeout', debugfunc('timeout'));

        socket.end("Hi");
    } );

    console.log("Proxy client up on port " + port + " connecting to " +
            serverHost + ":" + serverPort + " ...");
    return server.listen(port);
}
