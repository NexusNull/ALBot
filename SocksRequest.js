/**
 * Created by nexus on 12/05/17.
 */
var urlParser = require("url");
var extend = require("extend");
var Socks = require('socks');

var SocksRequest = function(socksOptions,requestOptions) {
    var self = this;
    this.requests = {};
    this.socksOptions = socksOptions;
    this.requestOptions = requestOptions;


    return function(){
        var url = "";
        for(var key in arguments){
            if(typeof arguments[key] == "string"){
                url = arguments[key];
                break;
            } else if(typeof arguments[key] == "object" && arguments[key] != null) {
                if(arguments[key].hasOwnProperty("url") && typeof arguments[key].url == "string"){
                    url = arguments[key].url;
                    break;
                }
            }

        }
        var host = urlParser.parse(url).host;
        if(host){
            if(!self.requests.hasOwnProperty(host)){
                var httpAgent = new Socks.Agent(extend(true, {}, self.socksOptions));
                var requestOptions = extend(true, {}, self.requestOptions);
                requestOptions.agent = httpAgent;
                self.requests[host] = require("request").defaults(requestOptions);
            }
            self.requests[host].apply(self.requests[host],arguments);
        } else {
            console.error("Could not find url for request");
        }
    };
};

module.exports = SocksRequest;


