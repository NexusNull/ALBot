/**
 * Created by nexus on 03/04/17.
 */
var request = require("request-defaults");
var cheerio = require("cheerio");
var net = require('net');
var extend = require("extend");
var Socket = require("socket.io-client");
var tough = require("tough-cookie");

var useragents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0",
    "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
];




var ProxyConnector = function(){

}

ProxyConnector.prototype.getSocketConnection = function (ipAddress, port){
    var socket =
     new Socket("http://"+ipAddress+":"+port, {
        autoConnect: false,
        extraHeaders: {
            "user-agent": useragents[4],
            referer: "http://adventure.land/",
            "accept-language": "en-US,en;q=0.5"
        }
    });
    socket.on("connect",function(){
        console.log("connect")
    })

    return socket;
};

ProxyConnector.prototype.getRequestConnection = function(proxyId){


    var cookieJar = request.jar();
    var defaultRequestOptions = {
        headers: {
            "user-agent": useragents[4],
            referer: "http://adventure.land/",
            "accept-language": "en-US,en;q=0.5"
        },
        jar: cookieJar
    };

    var newRequest = request.defaults(defaultRequestOptions); //require("./SocksRequest")(extend(true, {}, options), defaultRequestOptions);

    newRequest.cookieJar = cookieJar;
    return newRequest;
};

module.exports = new ProxyConnector();
