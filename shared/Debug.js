module.exports = function (debug) {
    this.debug = debug;
};

module.exports.prototype.print = function(prefix, name) {
    return function() {
        if (!this.debug) return;
        console.log(prefix + " " + name + " " + arguments.length);
    }.bind(this);
};

module.exports.prototype.attachListeners = function(obj, prefix, listeners) {
    if (!this.debug) return;
    listeners.forEach(function(listener) {
        obj.on(listener, this.print(prefix, listener));
    }.bind(this));
};

module.exports.prototype.d = function(message) {
    if (!this.debug) return;
    console.log(message);
};
