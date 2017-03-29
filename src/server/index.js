import net from 'net';
import { infoFromString, hostFromUrl, portFromUrl } from '../shared/http-parsing';
import { decode } from '../shared/base64';

const httpProxy = process.env.http_proxy;

const createTunnel = (data, socket) => {

    const httpInfo = infoFromString(data);
    let uri = httpInfo.uri;

    if (httpInfo.method === 'CONNECT')
        uri = "connect://" + uri;

    const host = hostFromUrl(uri);
    const port = portFromUrl(uri);

    const  tunnel = new net.Socket();
    let    connectHost = host;
    let    connectPort = port;

    if (httpProxy) {
        connectHost = hostFromUrl(httpProxy);
        connectPort = portFromUrl(httpProxy);
    }

    tunnel.on('error', (err) => console.error("[SERVER-TUNNEL] " + err.toString()));

    tunnel.on('end', () => socket.end());

    // Connect to host and send first chunk
    tunnel.connect(connectPort, connectHost, () => {

        if (httpInfo.method === 'CONNECT') {
            data = "HTTP/1.0 200 Connection established\r\n\r\n";
            socket.write(data);
        } else
            tunnel.write(data);
    });

    // Forward data to proxy client
    tunnel.on('data', (data) => socket.write(data));

    return tunnel;
};

const createServer = (serverPort) => {
    let splitted = null;
    const server = net.createServer( (socket) => {

        socket.on('data', (data) => {
            splitted = data.toString().split("\r\n");
            data = splitted[3];
            data = JSON.parse(data).data;
            data = decode(new Buffer(data.toString(), 'base64'));

            if (!socket.tunnel)
                socket.tunnel = createTunnel(data, socket);
            else
                socket.tunnel.write(data);
        });
    });

    return server.listen(serverPort);
};

export default (serverPort) => createServer(serverPort);
