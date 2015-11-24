var type = 'server';

if (process.argv.length > 2) {
    if (process.argv[2].indexOf('client') > 0) {
        type = 'client';
    }
}

if (type == 'client') {
    require("./client/index")("localhost", 8889, 8888);
} else {
    require("./server/index")(process.env.PORT || 8889);
}
