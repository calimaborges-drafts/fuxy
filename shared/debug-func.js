module.exports = {
    print: function(name) {
        return function() {
            console.log("Amount of arguments for " + name + ": " + arguments.length);
        };
    }
};
