var url = require("url");

module.exports = {
    httpInfoFromString: function(data) {
        var pattern = /(\S+)\s+(\S+)\s+(\S+)/i
        var matches = pattern.exec(data);

        return {
            method: matches[1],
            uri: matches[2],
            version: matches[3]
        };
    },

    hostFromUrl: function(uri) {
        uri = url.parse(uri);

        return uri.hostname;
    },

    portFromUrl: function(uri) {
        uri = url.parse(uri);

        if(!uri.port) {
            var protocol = uri.protocol.substring(0, uri.protocol.length - 1);
            switch (protocol) {
                case 'http': return 80;
                case 'https': return 443;
                default: return 80;
            }
        }

        return uri.port;
    }
}
