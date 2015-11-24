var express = require("express");
var bodyParser = require('body-parser');
var net = require('net');
var parser = require('./shared/http-parsing');

var proxyUrl = process.env.http_proxy;

var debugfunc = function(name) {
    return function() {
        console.log("Amount of arguments for " + name + ": " + arguments.length);
    };
};


module.exports = function(port) {
    var server = express();
    server.use(bodyParser.json());

    server.use(function(req, res) {
        var client = new net.Socket();
        var info = req.body;

        client.on('close', debugfunc('close'));
        client.on('connect', debugfunc('connect'));
        client.on('data', debugfunc('data'));
        client.on('drain', debugfunc('drain'));
        client.on('end', debugfunc('end'));
        client.on('error', function(error) {
            console.log(error);
        });
        client.on('lookup', debugfunc('lookup'));
        client.on('timeout', debugfunc('timeout'));

        client.on('data', function(data) {
            console.log('received data from proxy client');
            var message = {
                type: 'data',
                host: info.host,
                port: info.port,
                content: data.toString('base64')
            }

            res.end(JSON.stringify(message));
        });

        if (!info.host || !info.port) {
            return;
        }

        var connectPort = info.port;
        var connectHost = info.host;

        if (proxyUrl) {
            connectHost = parser.hostFromUrl(proxyUrl);
            connectPort = parser.portFromUrl(proxyUrl);
        }

        console.log("Connecting to " + connectHost + ":" + connectPort);
        client.connect(connectPort, connectHost, function() {
            client.write(new Buffer(info.content, 'base64').toString('ascii'));
        });
    });

    console.log("Proxy server up listening on " + port + "...");
    return server.listen(port);
}
