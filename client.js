var net = require("net");
var request = require('superagent');
require('superagent-proxy')(request);
var parser = require('./shared/http-parsing');
var debug = require('./shared/debug-func');

var proxyUrl = process.env.http_proxy;
var sockets = {};

function getSocket(id) {
    if (id == 'undefined') return null;
    clients.forEach(function (client) {
        if (client.id == id) return client;
    });
}

module.exports = function(serverHost, serverPort, port) {
    var server = net.createServer( function(socket) {
        socket.on('connect', function() {
            console.log("[CLIENT] Socket connection started");
        });
        socket.on('close', function() {
            console.log("[CLIENT] Socket connection closed");
        });
        socket.on('data', function(data) {
            console.log("[CLIENT] Data Start ---- ");
            console.log(data.toString());
            console.log("[CLIENT] Data End ----");
            var httpInfo = parser.httpInfoFromString(data);
            var uri = httpInfo.uri;
            if (httpInfo.method == 'CONNECT') {
                uri = "connect://" + uri;
            }

            var message = {
                id: socket.id,
                type: 'data',
                host: parser.hostFromUrl(uri),
                port: parser.portFromUrl(uri),
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

                    var responses = res.text.split('\/\/');
                    var response = JSON.parse(res.text);
                    socket.id = response.id;
                    console.log("[CLIENT] Socket id " + socket.id + " created");
                    socket.write(new Buffer(response.content, 'base64').toString('ascii'));
                    console.log("[CLIENT] Response Start ----");
                    console.log(new Buffer(response.content, 'base64').toString('ascii'));
                    console.log("[CLIENT] Response End ----")
                });
        });
        socket.on('drain', debug.print('[CLIENT] drain'));
        socket.on('end', function() {
            console.log("[CLIENT] Socked end");
        });
        socket.on('error', function (error) {
            console.log("[CLIENT] Error Start ----");
            console.log(error);
            console.log("[CLIENT] Error End ----");
        });
        socket.on('lookup', debug.print('[CLIENT] lookup'));
        socket.on('timeout', debug.print('[CLIENT] timeout'));
    } );

    console.log("Proxy client up on port " + port + " connecting to " +
            serverHost + ":" + serverPort + " ...");
    return server.listen(port);
}
