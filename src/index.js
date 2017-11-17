const client = async () => ({
  getUrl: () => "http://127.0.0.1:3128"
});

const server = async () => ({});

module.exports = {
  client,
  server
};
