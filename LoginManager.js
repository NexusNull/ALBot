/**
 * Created by nexus on 15/05/17.
 */
//var Database = require("./../NodeAlBot/Database");
var cheerio = require("cheerio");
/**
 *
 * @param {request} request
 * @param {socket} socket
 * @param {number} userId
 * @constructor
 */

var LoginManager = function (request, socket, userId, callback, character_to_load) {
    var self = this;
    if(!character_to_load)
        character_to_load = 0;
    this.request = request;
    this.socket = socket;
    this.localUserId = userId;
    this.gameUserId = "";
    this.gameUserAuth = "";
    this.socketAuth = "";
    this.callback = callback || function () {
        };

    /*
    this.database = new Database("userData.json", true, {
        clientNumber: 0,
        clients: [],
    });
    *
    */
    client = require("./userData.json").clients[0];
    console.log(client);
    //var client = this.database.data.clients[this.localUserId];
    switch (true) {
        case typeof client !== "object":
            close("Unknown client id: client does not exists");
            break;
        case typeof client.email !== "string":
            close("client email has to be a string");
            break;
        case typeof client.password !== "string":
            close("client password has to be a string");
            break;
        case typeof client.gameUserId !== "string":
            close("client gameUserId has to be a string");
            break;
        case typeof client.gameUserAuth !== "string":
            close("client gameUserAuth has to be a string");
            break;
        case typeof client.userAgent !== "string":
            close("client userAgent has to be a string");
            break;
        case typeof client.cfduid !== "string":
            close("client cfduid has to be a string");
            break;
        case typeof client.ipAddress !== "string":
            close("Missing default ip address for socket connection");
            break;
        case typeof client.ipAddress !== "string":
            close("Missing default port for socket connection");
    }

    if (client.gameUserAuth == "" || client.gameUserId == -1) {
        console.log("No viable Login session. Logging in.")
        this.request({url: "http://adventure.land"}, function (err, data, body) {
            if (!err) {
                self.login(client.email, client.password,function(data){
                    self.getCharacterIds(function (characterIds) {
                        if (characterIds == null) {
                            close("Login session invalid");
                        } else {
                            console.log(self.socketAuth);
                            callback({
                                request: self.request,
                                socket: self.socket,
                                gameUserId: data.gameUserId,
                                socketAuth: self.socketAuth,
                                ipAddress: client.ipAddress,
                                port: client.port,
                                characterId: characterIds[character_to_load]
                            })
                        }
                    });
                });
            } else {
                close("could not fetch index.html on login." + err)
            }
        });
    } else {
        console.log("Found Login Session. Trying to connect ...");

        var cookie1 = "auth=" + client.gameUserId + "-" + client.gameUserAuth + "; expires=Sat, 16 Apr 2022 04:27:02 GMT; path=/; domain=.adventure.land";
        var cookie2 = "__cfduid=" + client.cfduid + "; expires=Mon, 30 Apr 2018 19:45:51 GMT; path=/; domain=.adventure.land;";

        self.request.cookieJar.setCookie(cookie1, "http://adventure.land");
        self.request.cookieJar.setCookie(cookie2, "http://adventure.land");

        self.getCharacterIds(function (characterIds) {
            console.log("Available characters: " + characterIds);
            if (characterIds == null) {
                close("Login session invalid");
            } else {
                self.gameUserId = client.gameUserId;
                self.gameUserAuth = client.gameUserAuth;
                callback({
                    request: self.request,
                    socket: self.socket,
                    gameUserId: self.gameUserId,
                    socketAuth: self.socketAuth,
                    ipAddress: client.ipAddress,
                    port: client.port,
                    characterId: characterIds[character_to_load]
                })
            }
        });
    }
};

LoginManager.prototype.getCharacterIds = function (callback) {
    var self = this;
    this.request({url: "http://adventure.land"}, function (err, data, body) {
        if (!err) {
            var characterIds = [];
            //console.log(body)
            self.socketAuth = /user_auth="(\w+)"/.exec(body)[1];

            var $ = cheerio.load(body);
            var menu = $(".loginorselection>.menu").get(0);
            if (!menu) {
                if (typeof callback == "function")
                    callback(null);
                return;
            }
            var children = menu.children;
            for (var i = 0; i < children.length - 1; i++) {
                var element = children[i];
                if (element.name == "div") {
                    var result = /log_in.*'(\d*)'/.exec(element.attribs.onclick);
                    if (result) {
                        characterIds.push(result[1]);
                    }
                }
            }
            if (typeof callback == "function")
                callback(characterIds);
        } else {
            console.log("could not fetch index.html on login.");
            console.log(err)

        }
    });
};
LoginManager.prototype.login = function (email, password, callback) {
    if(typeof callback !== "function")
        callback = function(){};
    var self = this;
    this.request.post(
        {
            url: "http://adventure.land/api/signup_or_login",
            formData: {
                arguments: '{"email":"' + email + '","password":"' + password + '"}',
                method: "signup_or_login"
            },
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "Accept": "application/json, text/javascript, */*; q=0.01"
            }
        },
        function (err, data, body) {
            if (!err) {
                var messages = JSON.parse('{"messages":' + body + '}').messages;
                var loginSuccessful = false;
                for (var i = 0; i < messages.length; i++) {
                    if (typeof messages[i].type == "string") {
                        if (messages[i].type == "message") {
                            if (typeof messages[i].message == "string") {
                                if (messages[i].message == "Logged In!") {
                                    console.log("Login successful");
                                    loginSuccessful = true;
                                }
                            }
                        }
                    }
                }
                if (loginSuccessful) {
                    var cookies = self.request.cookieJar.getCookies("http://adventure.land/");
                    for (var i in cookies) {
                        if (cookies[i].key == "auth") {
                            var data = cookies[i].value.split("-");
                            var loginData = {};
                            loginData.gameUserId = data[0];
                            loginData.gameUserAuth = data[1];
                        }
                    }
                    callback(loginData);
                } else {
                    close("Login unsuccessful")
                }
            } else {
                close("Error in response after login" + err)
            }
        }
    );
};

function close(error) {
    console.error(error);
    process.exit(1);
}

module.exports = LoginManager;
