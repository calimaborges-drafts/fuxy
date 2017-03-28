import server from '../src/server';
import client from '../src/client';

const kServerPort = 8887;
const kClientPort = 8889;
const kServerHost = "127.0.0.1";
const kClientHost = "127.0.0.1";

let proxyServer = null;
let proxyClient = null;

export const clientUrl = `http://${kClientHost}:${kClientPort}`;

export const useServer = () => {
    beforeAll( () => {
        proxyServer = server(kServerPort);
        proxyClient = client(kServerHost, kServerPort, kClientPort);
    });

    afterAll( () => {
        proxyServer.close();
        proxyClient.close();
    });
}