/** Core dependencies **/
var net = require('net');

/** NPM Dependencies **/

/** Shared dependencies **/
var parser = require('../shared/http-parsing');
var Debug = require('../shared/Debug');

/** Global Variables **/
var debug = new Debug(true);
var httpProxy = process.env.http_proxy;

var createTunnel = function(data, socket) {
    debug.d("[SERVER] Creating socket tunnel");

    // O servidor espera o primeiro pacote no formato similar ao exemplo:
    // POST / HTTP/1.0
    // Host: 127.0.0.1:8887
    // {
    //    "host": "test.carlosborg.es",
    //    "port":"443",
    //    "chunk":"Q09OTkVDVCB0ZXN0LmNhcmxvc2JvcmcuZXM6NDQzIEhUVFAvMS4xDQpIb3N0
    //             OiB0ZXN0LmNhcmxvc2JvcmcuZXM6NDQzDQpDb25uZWN0aW9uOiBjbG9zZQ0K
    //             DQo="
    // }
    // Os parametros podem ser bem fixos conforme os splits abaixo pois a
    // conexão é estabelecida pelo cliente do nosso proxy e portanto temos
    // completo controle do que trafega.

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

    var tunnel = new net.Socket();
    var host = json.host;
    var port = json.port;
    var data = new Buffer(json.chunk, 'base64').toString('ascii');
    var connectHost = host;
    var connectPort = port;

    // Caso servidor necessite de proxy
    if (httpProxy) {
        connectHost = parser.hostFromUrl(httpProxy);
        connectPort = parser.portFromUrl(httpProxy);
    }

    // Captura eventos não tratados para debug
    debug.attachListeners(tunnel, '[SERVER-TUNNEL]', ['connect', 'close', 'drain', 'end', 'lookup', 'timeout', 'data']);

    // Caputra erros
    tunnel.on('error', function(err) {
        console.error("[SERVER-TUNNEL] " + err.toString());
    });

    // Estabelece conexão com servidor destino e envia primeiro 'chunk'
    tunnel.connect(connectPort, connectHost, function() {
        debug.d("[SERVER-TUNNEL] -> " + connectHost + ":" + connectPort + " -> " + host + ":" + port );
        debug.d("[SERVER-TUNNEL] ---- Start Data ---->");
        debug.d(data.toString());
        debug.d("[SERVER-TUNNEL] ---- End Data ---->");
        tunnel.write(data);
    });

    // Quando receber um dado encaminha para o socket que se comunica com o
    // cliente do proxy.
    tunnel.on('data', function(data) {
        debug.d("[SERVER-TUNNEL] <---- Start Data ----");
        debug.d(data.toString());
        debug.d("[SERVER-TUNNEL] <---- End Data ----");
        socket.write(data);
    });

    // Retorna o tunnel criado
    return tunnel;
};

var createServer = function(serverPort) {
    var server = net.createServer( function(socket) {
        debug.attachListeners(socket, '[SERVER]', ['connect', 'close', 'drain', 'end', 'error', 'lookup', 'timeout', 'data']);

        socket.on('data', function(data) {
            if (!socket.tunnel) {
                socket.tunnel = createTunnel(data, socket);
            } else {
                socket.tunnel.write(data);
            }

            debug.d("[SERVER] <---- Start Data ----");
            debug.d(data.toString());
            debug.d("[SERVER] <---- End Data ----");
        });
    });

    return server.listen(serverPort);
};

module.exports = function(serverPort) {
    debug.d("[SERVER] -> " + serverPort);
    return createServer(serverPort);
};
