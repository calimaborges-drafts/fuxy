import client from "./client";
import server from "./server";

let type = "server";

if (process.argv.length > 2) {
    if (process.argv[2].indexOf("client") > 0) {
        type = "client";
    }
}

if (type === "client") {
    client("127.0.0.1", 8889, 8888);
} else {
    server(process.env.PORT || 8889);
}
