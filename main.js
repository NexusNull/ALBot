var argv = require('minimist')(process.argv.slice(2));


process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log(exception.stack);

});

if(typeof argv.userId != "number"){
    console.error("Usage: node AdventureLandBot --userId=<userId>")
    process.exit(1);
}

var proxy = require("./proxyConnector")


var LoginManager = require("./LoginManager");
var Game = require("./game");

new LoginManager(proxy.getRequestConnection(0), proxy.getSocketConnection("52.59.255.62",8090,0), argv.userId, function(data){
    var game = new Game(data);
    game.start();
},0);

