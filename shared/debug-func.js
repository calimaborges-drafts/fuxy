module.exports = {
    print: function(prefix, name) {
        return function() {
            console.log(prefix + " " + name + " " + arguments.length);
        };
    },

    attachListeners: function(obj, prefix, listeners) {
        listeners.forEach(function(listener) {
            obj.on(listener, this.print(prefix, listener));
        }.bind(this));
    }
};
