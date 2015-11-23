var net = require("net");
var request = require('superagent');

var proxyUrl = process.env.http_proxy;

var debugfunc = function(name) {
    return function() {
        console.log("Amount of arguments for " + name + ": " + arguments.length);
    };
};

module.exports = function(serverHost, serverPort, port) {
    var server = net.createServer( function(socket) {
        socket.on('connect', debugfunc('connect'));
        socket.on('close', function() {
            console.log("Connection closed with proxy client");
        });
        socket.on('data', function(data) {
            var message = {
                type: 'data',
                host: 'test.carlosborg.es',
                port: '80',
                content: data.toString('base64')
            }

            var req = request.post("http://" + serverHost + ":" + serverPort);

            if (proxyUrl) {
                req.proxy(proxyUrl);
            }

            req.send(message)
                .end(function(err, res) {
                    if (err) {
                        socket.end('ERROR: Proxy failed');
                    }
                    var response = JSON.parse(res.text);
                    socket.write(response.content.toString('ascii'));
                });
        });
        socket.on('drain', debugfunc('drain'));
        socket.on('end', debugfunc('end'));
        socket.on('error', function (error) {
            console.log(error);
        });
        socket.on('lookup', debugfunc('lookup'));
        socket.on('timeout', debugfunc('timeout'));
    } );

    console.log("Proxy client up on port " + port + " connecting to " +
            serverHost + ":" + serverPort + " ...");
    return server.listen(port);
}
