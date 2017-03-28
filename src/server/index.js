import net from 'net';
import { infoFromString, hostFromUrl, portFromUrl } from '../shared/http-parsing';
import Debug from '../shared/Debug';
import { decode } from '../shared/base64';

const debug = new Debug(true);
const httpProxy = process.env.http_proxy;

const createTunnel = (data, socket) => {
    debug.d("[SERVER] Creating socket tunnel");

    const httpInfo = infoFromString(data);
    let uri = httpInfo.uri;

    if (httpInfo.method === 'CONNECT') {
        uri = "connect://" + uri;
    }

    const host = hostFromUrl(uri);
    const port = portFromUrl(uri);

    const  tunnel = new net.Socket();
    let    connectHost = host;
    let    connectPort = port;

    // Caso servidor necessite de proxy
    if (httpProxy) {
        connectHost = hostFromUrl(httpProxy);
        connectPort = portFromUrl(httpProxy);
    }

    // Captura eventos não tratados para debug
    debug.attachListeners(tunnel, '[SERVER-TUNNEL]', ['connect', 'close', 'drain', 'end', 'lookup', 'timeout', 'data']);

    // Caputra erros
    tunnel.on('error', function(err) {
        console.error("[SERVER-TUNNEL] " + err.toString());
    });

    tunnel.on('end', function() {
        socket.end();
    });

    // Estabelece conexão com servidor destino e envia primeiro 'chunk'
    tunnel.connect(connectPort, connectHost, function() {
        if (httpInfo.method === 'CONNECT') {
            data = "HTTP/1.0 200 Connection established\r\n\r\n";
            socket.write(data);
        } else {
            tunnel.write(data);
        }

        debug.d("[SERVER-TUNNEL] -> " + connectHost + ":" + connectPort + " -> " + host + ":" + port );
        debug.d("[SERVER-TUNNEL] ---- Start Data ---->");
        debug.d(data.toString());
        debug.d("[SERVER-TUNNEL] ---- End Data ---->");
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

const createServer = (serverPort) => {
    let splitted = null;
    const server = net.createServer( (socket) => {
        debug.attachListeners(socket, '[SERVER]', ['connect', 'close', 'drain', 'end', 'error', 'lookup', 'timeout', 'data']);

        socket.on('data', (data) => {
            console.log(data.toString());
            console.log(data.toString().split("\r\n"));
            splitted = data.toString().split("\r\n");
            data = splitted[3];
            data = JSON.parse(data).data;
            console.log(data);
            data = decode(new Buffer(data.toString(), 'base64'));
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

export default (serverPort) => {
    debug.d(`[SERVER] -> ${serverPort}`);
    return createServer(serverPort);
};
