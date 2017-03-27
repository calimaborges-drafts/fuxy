module.exports = {
    encode: function(data) {
        return new Buffer(data, 'binary').toString('base64');
    },

    decode: function(data) {
        return new Buffer(data, 'base64');
    }
};
