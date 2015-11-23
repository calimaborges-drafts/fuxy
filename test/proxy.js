var server = require("../server");
var client = require("../index");
var request = require('superagent');
var assert = require('assert');
var status = require('http-status');

require('superagent-proxy')(request);

describe('proxy', function() {
    var proxyServer;
    var proxyClient;
    var proxyClientPort;
    var proxyServerPort;
    var host;

    before(function() {
        proxyServerPort = 8887;
        proxyClientPort = 8889;
        host = "127.0.0.1";

        proxyServer = server(proxyServerPort);
        proxyClient = client(host, proxyServerPort, proxyClientPort);
    });

    after(function() {
        proxyServer.close();
        proxyClient.close();
    });

    it('should redirect request to proxy server', function(done) {
        request.get("http://test.carlosborg.es/")
            .proxy("http://" + host + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.status, status.OK);
                var result = JSON.parse(res.text);
                assert.deepEqual( { status: 'active' }, result );
                done();
            });
    });
});
