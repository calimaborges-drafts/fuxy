var express = require("express");
var bodyParser = require('body-parser');
var net = require('net');
var parser = require('./shared/http-parsing');
var debug = require('./shared/debug-func');
var uniqid = require('./shared/uniqid');

var proxyUrl = process.env.http_proxy;
var clients = [];

function getClient(id) {
    if (id == 'undefined') return null;
    clients.forEach(function (client) {
        if (client.id == id) return client;
    });
}

module.exports = function(port) {
    var server = express();
    server.use(bodyParser.json());

    server.use(function(req, res) {
        var info = req.body;
        var client = getClient(info.id);

        if (!client) {
            client = new net.Socket();
            client.id = uniqid.uuid();
            clients.push(client);
            client.on('connect', function() {
                console.log("[SERVER] Socket connection started for " + client.id);
            });
            client.on('close', function() {
                console.log("[SERVER] Socket connection closed");
            });
            client.on('drain', debug.print('[SERVER] drain'));
            client.on('end', function() {
                res.end();
                console.log("[SERVER] Socked end");
            });
            client.on('error', function(error) {
                console.log(error);
            });
            client.on('lookup', debug.print('[SERVER] lookup'));
            client.on('timeout', debug.print('[SERVER] timeout'));
            client.on('data', function(data) {
                console.log("[SERVER] Data Start ---- ");
                console.log(data.toString());
                console.log("[SERVER] Data End ----");
                var message = {
                    id: client.id,
                    type: 'data',
                    host: info.host,
                    port: info.port,
                    content: data.toString('base64')
                }

                res.write(JSON.stringify(message));
                res.write('\/\/');
            });

            var connectPort = info.port;
            var connectHost = info.host;

            if (proxyUrl) {
                connectHost = parser.hostFromUrl(proxyUrl);
                connectPort = parser.portFromUrl(proxyUrl);
            }
            client.connect(connectPort, connectHost, function() {
                console.log("[SERVER] Connecting to " + connectHost + ":" + connectPort + " for client " + client.id);
                client.write(new Buffer(info.content, 'base64').toString('ascii'));
            });
        } else {
            console.log("*********************************************");
            console.log("[SERVER] Sending data to client " + client.id);
            client.write(new Buffer(info.content, 'base64').toString('ascii'));
        }
    });

    console.log("Proxy server up listening on " + port + "...");
    return server.listen(port);
}
