const request = require("superagent");
require("superagent-proxy")(request);
const { OK } = require("http-status");

const { server, client } = require("./");

FUXY_SERVER_PORT = 8887;
FUXY_SERVER_URL = `http://127.0.0.1:${FUXY_SERVER_PORT}`;
FUXY_CLIENT_PORT = 8889;

describe("fuxy proxy", () => {
  let proxyServer;
  let proxyClient;

  beforeAll(async () => {
    proxyServer = await server(FUXY_SERVER_PORT);
    proxyClient = await client(FUXY_SERVER_URL, FUXY_CLIENT_PORT);
  });

  it("should work for simple GET request", async () =>
    new Promise((resolve, reject) => {
      request
        .get("http://httpbin.org/get")
        .proxy(proxyClient.getUrl())
        .end((err, response) => {
          if (err) reject(err);
          expect(response.status).toBe(OK);
          resolve();
        });
    }));
});
