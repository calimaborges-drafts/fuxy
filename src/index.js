const net = require("net");

const clientList = [];

const client = async (fuxyServerUrl, port) => {
  const getUrl = () => `http://127.0.0.1:${port}`;
  const server = net.createServer(socket => {
    socket.on("error", err => console.error(`error: ${err}`));
    socket.on("data", data => console.log(`data: ${data}`));
  });
  server.listen(port);

  return {
    getUrl
  };
};

const server = async () => ({});

module.exports = {
  client,
  server
};
