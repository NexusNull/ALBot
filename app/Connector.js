var Socket = require("socket.io-client");

const Connector = function (port) {
    this.port = port;
    this.socket = null;
    this.queue = [];
};

Connector.prototype.send = async function (event, data) {
    return new Promise(function (resolve, reject) {
        socket.emit(event,data);
    })
};

Connector.prototype.connect = function () {
    const self = this;

    socket = new Socket("wss://localhost:" + this.port, {
        autoConnect: false,
    });

    socket.on("connect", function () {
        self.socket = socket;
    });

    socket.on("disconnected", function () {
        self.socket = socket;
        socket.destroy();
    });

    socket.connect();
};

module.exports = Connector;