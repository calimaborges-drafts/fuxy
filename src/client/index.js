import net from 'net';
import { portFromUrl, hostFromUrl } from '../shared/http-parsing';
import { encode } from '../shared/base64';

const httpProxy = process.env.http_proxy;

const createTunnel = (serverHost, serverPort, data, socket) => {
    const tunnel = new net.Socket();
    let connectHost = serverHost;
    let connectPort = serverPort;

    tunnel.on('error', (err) => console.error("[CLIENT-TUNNEL] " + err.toString()));

    if (httpProxy) {
        connectPort = portFromUrl(httpProxy);
        connectHost = hostFromUrl(httpProxy);
    }

    tunnel.connect(connectPort, connectHost, () => tunnel.write(data));
    tunnel.on('end', () => socket.end());
    tunnel.on('data', (data) => socket.write(data));
    return tunnel;
};

const createServer = (serverHost, serverPort, clientPort) => {

    const server = net.createServer( (socket) => {
        socket.on('error', (err) => console.error("[CLIENT] " + err.toString()));

        socket.on('data', (data) => {
            data = encode(data);

            data = `POST http://${serverHost}:${serverPort} HTTP/1.0\r
                    Host: ${serverHost}:${serverPort}\r
                    Content-Type: application/json\r
                    { "data": "${data}"}
                    \r
                    \r
                    `;

            if (!socket.tunnel)
                socket.tunnel = createTunnel(serverHost, serverPort, data, socket);
            else
                socket.tunnel.write(data);
        });
    });

    return server.listen(clientPort);
};

export default (serverHost, serverPort, clientPort) => createServer(serverHost, serverPort, clientPort);
