import net from 'net';
import Debug from '../shared/Debug';
import { portFromUrl, hostFromUrl } from '../shared/http-parsing';
import { encode } from '../shared/base64';

const debug = new Debug(process.env.NODE_ENV === 'development');
const httpProxy = process.env.http_proxy;

const createTunnel = (serverHost, serverPort, data, socket) => {
    debug.d("[CLIENT] Creating tunnel for socket");

    const tunnel = new net.Socket();

    let connectHost = serverHost;
    let connectPort = serverPort;

    debug.attachListeners(tunnel, '[CLIENT-TUNNEL]', ['connect', 'close', 'drain', 'end', 'lookup', 'timeout', 'data']);
    tunnel.on('error', function(err) {
        console.error("[CLIENT-TUNNEL] " + err.toString());
    });

    if (httpProxy) {
        connectPort = portFromUrl(httpProxy);
        connectHost = hostFromUrl(httpProxy);
    }

    tunnel.connect(connectPort, connectHost, function() {
        debug.d("[CLIENT-TUNNEL] -> " + connectHost + ":" + connectPort + " -> " + serverHost + ":" + serverPort);
        debug.d("[CLIENT-TUNNEL] ---- Start Data ---->");
        debug.d(data.toString());
        debug.d("[CLIENT-TUNNEL] ---- End Data ---->");

        tunnel.write(data);
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

const createServer = (serverHost, serverPort, clientPort) => {
    const server = net.createServer( function(socket) {
        debug.attachListeners(socket, '[CLIENT]', ['connect', 'close', 'drain', 'end', 'error', 'lookup', 'timeout', 'data']);

        socket.on('error', function(err) {
            console.error("[CLIENT] " + err.toString());
        });

        socket.on('data', function(data) {
            data = encode(data);
            data = "POST http://" + serverHost + ":" + serverPort + " HTTP/1.0\r\n" +
                   "Host: " + serverHost + ":" + serverPort + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "{ \"data\": \"" + data + "\"}" +
                   "\r\n\r\n";
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

module.exports = (serverHost, serverPort, clientPort) => {
    debug.d("[CLIENT] " + clientPort + " -> " + serverHost + ":" + serverPort);
    return createServer(serverHost, serverPort, clientPort);
};
