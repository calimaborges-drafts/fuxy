/** Core Dependencies **/
var net = require('net');

/** NPM Dependencies **/

/** Local Dependencies**/
var Debug = require('../shared/Debug');
var parser = require('../shared/http-parsing');
var base64 = require('../shared/base64');

/** Global Variables **/
var debug = new Debug(true);
var httpProxy = process.env.http_proxy;

var createTunnel = function(serverHost, serverPort, data, socket) {
    debug.d("[CLIENT] Creating tunnel for socket");

    var tunnel = new net.Socket();

    var connectHost = serverHost;
    var connectPort = serverPort;

    debug.attachListeners(tunnel, '[CLIENT-TUNNEL]', ['connect', 'close', 'drain', 'end', 'lookup', 'timeout', 'data']);
    tunnel.on('error', function(err) {
        console.error("[CLIENT-TUNNEL] " + err.toString());
    });

    if (httpProxy) {
        connectPort = parser.portFromUrl(httpProxy);
        connectHost = parser.hostFromUrl(httpProxy);
    }

    tunnel.connect(connectPort, connectHost, function() {
        debug.d("[CLIENT-TUNNEL] -> " + connectHost + ":" + connectPort + " -> " + serverHost + ":" + serverPort);
        debug.d("[CLIENT-TUNNEL] ---- Start Data ---->");
        debug.d(data.toString());
        debug.d("[CLIENT-TUNNEL] ---- End Data ---->");

        // tunnel.write("POST http://" + serverHost + ":" + serverPort + " HTTP/1.0\r\n");
        // tunnel.write("Host: " + serverHost + ":" + serverPort + "\r\n");
        tunnel.write(data);
        // tunnel.write("\r\n\r\n");
    });

    tunnel.on('end', function() {
        socket.end();
    });

    tunnel.on('data', function(data) {
        debug.d("[CLIENT-TUNNEL] <---- Start Data ----");
        debug.d(data.toString());
        debug.d("[CLIENT-TUNNEL] <---- End Data ----");
        socket.write(data);
    });

    return tunnel;
};

var createServer = function(serverHost, serverPort, clientPort) {
    var server = net.createServer( function(socket) {
        debug.attachListeners(socket, '[CLIENT]', ['connect', 'close', 'drain', 'end', 'error', 'lookup', 'timeout', 'data']);

        socket.on('error', function(err) {
            console.error("[CLIENT] " + err.toString());
        });

        socket.on('data', function(data) {
            data = base64.encode(data);
            if (!socket.tunnel) {
                socket.tunnel = createTunnel(serverHost, serverPort, data, socket);
            } else {
                socket.tunnel.write(data);
            }

            debug.d("[CLIENT] <---- Start Data ----");
            debug.d(data.toString());
            debug.d("[CLIENT] <---- End Data ----");
        });
    });

    return server.listen(clientPort);
};

module.exports = function(serverHost, serverPort, clientPort) {
    debug.d("[CLIENT] " + clientPort + " -> " + serverHost + ":" + serverPort);
    return createServer(serverHost, serverPort, clientPort);
};
