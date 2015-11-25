var net = require('net');
var parser = require('../shared/http-parsing');
var Debug = require('../shared/Debug');

var debug = new Debug(false);
var verbose = true;
var httpProxy = process.env.http_proxy;
var clients = [];

var createTunnel = function(host, port, data, socket) {
    var tunnel = new net.Socket();
    var connectHost = parser.hostFromUrl(httpProxy);
    var connectPort = parser.portFromUrl(httpProxy);

    debug.attachListeners(tunnel, '[SERVER-TUNNEL]', ['connect', 'close', 'drain', 'end', 'lookup', 'timeout', 'data']);
    tunnel.on('error', function(err) {
        console.error("[SERVER-TUNNEL] " + err.toString());
    });

    tunnel.connect(connectPort, connectHost, function() {
        debug.d("*********************** FUNCIONOU *************************");
        debug.d("[SERVER-TUNNEL] -> " + connectHost + ":" + connectPort + " -> " + host + ":" + port );
        debug.d("[SERVER-TUNNEL] ---- Start Data ---->");
        debug.d(data.toString());
        debug.d("[SERVER-TUNNEL] ---- End Data ---->");
        tunnel.write(data);
    });

    tunnel.on('data', function(data) {
        debug.d("[SERVER-TUNNEL] <---- Start Data ----");
        debug.d(data.toString());
        debug.d("[SERVER-TUNNEL] <---- End Data ----");
        socket.write(data);
    });

    return tunnel;
};

var createServer = function(serverPort) {
    var server = net.createServer( function(socket) {
        debug.attachListeners(socket, '[SERVER]', ['connect', 'close', 'drain', 'end', 'error', 'lookup', 'timeout', 'data']);

        socket.on('data', function(data) {
            var splitedData = data.toString().split("\r\n");

            if (splitedData.length < 3) {
                socket.write("HTTP/1.0 400 Bad Request");
                socket.write("\r\n\r\n");
            }

            var json = JSON.parse(splitedData[2]);

            if (!json) {
                socket.write("HTTP/1.0 400 Bad Request");
                socket.write("\r\n\r\n");
            }

            debug.d("[SERVER] <---- Start Data ----");
            debug.d(data.toString());
            debug.d("[SERVER] <---- End Data ----");

            createTunnel(json.host, json.port, new Buffer(json.chunk, 'base64').toString('ascii'), socket);
        });
    });

    return server.listen(serverPort);
};

module.exports = function(serverPort) {
    debug.d("[SERVER] -> " + serverPort);
    return createServer(serverPort);
};
