var server = require("./index");
var client = require("./index");
var request = require('superagent');
var assert = require('assert');
var status = require('http-status');
var base64 = require('./base64');

require('superagent-proxy')(request);

describe('proxy', function() {
    var proxyServer;
    var proxyClient;
    var proxyClientPort;
    var proxyServerPort;
    var proxyClientHost;
    var proxyClientHost

    before(function() {
        proxyServerPort = 8887;
        proxyClientPort = 8889;
        proxyClientHost = "127.0.0.1";
        proxyServerHost = "127.0.0.1";

        // proxyServerPort = 80; //heroku
        // proxyServerHost = "kali-xypro.herokuapp.com"; //heroku

        proxyServer = server(proxyServerPort);
        proxyClient = client(proxyServerHost, proxyServerPort, proxyClientPort);
    });

    after(function() {
        proxyServer.close();
        proxyClient.close();
    });

    it('should encode and decode base64', function(done) {
        var text = new Buffer('First text');
        var encoded = base64.encode(text);
        var decoded = base64.decode(text);

        assert.equal(text.toString(), decoded.toString());
        assert.notEqual(text.toString(), encoded.toString());

        done();
    });

    it('should redirect HTTP request to proxy server', function(done) {
        request.get("http://carlosborg.es/test.html")
            .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.status, status.OK);
                var result = JSON.parse(res.text);
                assert.deepEqual( { status: 'active' }, result );
                done();
            });
    });

    it('should redirect large HTTP request to proxy server', function(done) {
        request.get("http://carlosborg.es/carlos-borges-escrita-baixo-logo.svg")
            .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.body.length, 6959);
                done();
            });
    });

    it('should redirect HTTPS request to proxy server', function(done) {
        request.get("https://carlosborg.es/test.html")
            .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.status, status.OK);
                var result = JSON.parse(res.text);
                assert.deepEqual( { status: 'active' }, result );
                done();
            });
    });
});
