var express = require("express");
var bodyParser = require('body-parser');
var net = require('net');

module.exports = function(port) {
    var server = express();
    server.use(bodyParser.json());

    server.use(function(req, res) {
        var info = req.body;
        var client = new net.Socket();
        console.log("Connecting to " + info.host + ":" + info.port);
        client.connect(info.port, info.host, function() {
            client.write(new Buffer(info.content, 'base64').toString('ascii'));
        });

        client.on('data', function(data) {
            var message = {
                type: 'data',
                host: 'test.carlosborg.es',
                port: '80',
                content: data.toString('base64')
            }

            res.end(JSON.stringify(req.body));
        });
    });

    console.log("Proxy server up listening on " + port + "...");
    return server.listen(port);
}
