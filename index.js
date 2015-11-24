var type = 'server';

if (process.argv.length > 2) {
    if (process.argv[2].indexOf('client') > 0) {
        type = 'client';
    }
}

if (type == 'client') {
    require("./client")("kali-xypro.herokuapp.com", 80, 8888);
} else {
    require("./server")(process.env.PORT || 8889);
}
