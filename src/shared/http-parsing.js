import url from 'url';

export const infoFromString = (data) => {
    const pattern = /(\S+)\s+(\S+)\s+(\S+)/i;
    const matches = pattern.exec(data);

    return {
        method:  matches[1],
        uri:     matches[2],
        version: matches[3]
    };
};

export const hostFromUrl = (uri) => {
    uri = url.parse(uri);
    return uri.hostname;
};

export const portFromUrl = (uri) => {
    uri = url.parse(uri);

    if(!uri.port) {
        let protocol = 'connect';
        if (uri.protocol) {
            protocol = uri.protocol.substring(0, uri.protocol.length - 1);
        }

        switch (protocol) {
            case 'http': return "80";
            case 'https': return "443";
            default: return "80";
        }
    }

    return uri.port;
};