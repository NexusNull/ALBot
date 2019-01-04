/**
 * Created by nexus on 15/05/17.
 */
const request = require("request-promise-native");
const vm = require('vm');
/**
 *
 * @constructor
 */
var HttpWrapper = function (sessionCookie, userAuth, userId) {
    this.sessionCookie = sessionCookie ? sessionCookie : "";
    this.userAuth = userAuth ? userAuth : "";
    this.userId = userId ? userId : 0;
};

/**
 *
 * @param email
 * @param password
 * @return {Object}
 */
HttpWrapper.prototype.login = async function (email, password) {
    console.log("Logging in.");
    var self = this;
    return new Promise(async function (resolve, reject) {
        try {
            await request({url: "https://adventure.land"});
        } catch (err) {
            reject("could not fetch index.html on login." + err);
        }
        try {
            await request.post(
                {
                    url: "https://adventure.land/api/signup_or_login",
                    formData: {
                        arguments: '{"email":"' + email + '","password":"' + password + '","only_login":true}',
                        method: "signup_or_login"
                    },
                    headers: {
                        "x-requested-with": "XMLHttpRequest",
                        "Accept": "application/json, text/javascript, */*; q=0.01",
                        "user-agent": "AdventureLandBot: (v1.0.0)",
                    }
                }, function (err, response, html) {
                    if (err) {
                        console.error("Error login in:");
                        console.error(err);
                        process.exit(1)
                    } else {
                        var data = JSON.parse(html);
                        var loginSuccessful = false;
                        for (let i = 0; i < data.length; i++) {
                            if (typeof data[i].type === "string") {
                                if (data[i].type === "message") {
                                    if (typeof data[i].message === "string") {
                                        if (data[i].message === "Logged In!") {
                                            console.log("Login successful.");
                                            loginSuccessful = true;
                                        }
                                    }
                                } else if (data[i].type === "ui_error") {
                                    if (typeof data[i].message === "string") {
                                        if (data[i].message === "Wrong Password") {
                                            console.log("Login failed.");
                                            loginSuccessful = false;
                                        }
                                    }
                                }
                            }
                        }
                        if (loginSuccessful) {
                            let cookies = response.headers["set-cookie"];
                            for (let i = 0; i < cookies.length; i++) {
                                var match = /auth=([0-9]+-[a-zA-Z0-9]+)/g.exec(cookies[i]);
                                if (match) {
                                    self.sessionCookie = match[1];
                                    self.userId = match[1].split("-")[0];
                                }
                            }
                        } else {
                            process.exit(0)
                        }
                        resolve(loginSuccessful);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
};

HttpWrapper.prototype.login = async function (email, password) {
    console.log("Logging in.");
    var self = this;
    return new Promise(async function (resolve, reject) {
        try {
            await request({url: "https://adventure.land"});
        } catch (err) {
            reject("could not fetch index.html on login." + err);
        }
        try {
            await request.post(
                {
                    url: "https://adventure.land/api/signup_or_login",
                    formData: {
                        arguments: '{"email":"' + email + '","password":"' + password + '","only_login":true}',
                        method: "signup_or_login"
                    },
                    headers: {
                        "x-requested-with": "XMLHttpRequest",
                        "Accept": "application/json, text/javascript, */*; q=0.01",
                        "user-agent": "AdventureLandBot: (v1.0.0)",
                    }
                }, function (err, response, html) {
                    if (err) {
                        console.error("Error login in:");
                        console.error(err);
                        process.exit(1)
                    } else {
                        var data = JSON.parse(html);
                        var loginSuccessful = false;
                        for (let i = 0; i < data.length; i++) {
                            if (typeof data[i].type === "string") {
                                if (data[i].type === "message") {
                                    if (typeof data[i].message === "string") {
                                        if (data[i].message === "Logged In!") {
                                            console.log("Login successful.");
                                            loginSuccessful = true;
                                        }
                                    }
                                } else if (data[i].type === "ui_error") {
                                    if (typeof data[i].message === "string") {
                                        console.log(data[i].message);
                                        loginSuccessful = false;
                                    }
                                }
                            }
                        }
                        if (loginSuccessful) {
                            let cookies = response.headers["set-cookie"];
                            for (let i = 0; i < cookies.length; i++) {
                                var match = /auth=([0-9]+-[a-zA-Z0-9]+)/g.exec(cookies[i]);
                                if (match) {
                                    self.sessionCookie = match[1];
                                    self.userId = match[1].split("-")[0];
                                }
                            }
                        } else {
                            process.exit(0)
                        }
                        resolve(loginSuccessful);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
};

HttpWrapper.prototype.getCharacters = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        var characters = [];
        var html = await request.post({
            url: "https://adventure.land/api/servers_and_characters",
            headers: {cookie: "auth=" + self.sessionCookie},
            formData: {method: "servers_and_characters", arguments: "{}"}
        });
        let data = JSON.parse(html)[0];
        resolve(data.characters);
    })
};

HttpWrapper.prototype.getServerList = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        var options = {
            url: "https://adventure.land/api/get_servers",
            method: "POST",
            headers: {
                "user-agent": "AdventureLandBot: (v1.0.0)",
                "x-requested-with": "XMLHttpRequest",
                cookie: "auth=" + self.sessionCookie
            },
            form: {
                method: "get_servers"
            }
        };

        let data = JSON.parse(await request(options));

        if (data[0].type === "success")
            resolve(data[0].message);
        else
            reject();
    })
};

HttpWrapper.prototype.checkLogin = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        var characters = [];
        var html = await request.post({
            url: "https://adventure.land/api/servers_and_characters",
            headers: {cookie: "auth=" + self.sessionCookie},
            formData: {method: "servers_and_characters", arguments: "{}"}
        });
        let data = JSON.parse(html)[0];
        if (data.args && data.args[0] === "Not logged in.") {
            resolve(false);
        } else if (data.type && data.type === "servers_and_characters") {
            resolve(true);
        }
        resolve(false);
    })
};
HttpWrapper.prototype.getGameData = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        try {
            let code = await request({
                url: "https://adventure.land/data.js",
                headers: {
                    "x-requested-with": "XMLHttpRequest",
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "user-agent": "AdventureLandBot: (v1.0.0)",
                    "cookie": "auth=" + self.sessionCookie,
                }
            });
            let sandbox = {};
            let context = vm.createContext(sandbox);
            vm.runInContext(code, context);
            resolve(sandbox.G)
        } catch (e) {
            reject("Could not retrieve game data");
        }
    });
};

HttpWrapper.prototype.getUserAuth = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        var html = await request({
            url: "https://adventure.land/",
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "user-agent": "AdventureLandBot: (v1.0.0)",
                "cookie": "auth=" + self.sessionCookie,
            }
        });
        var match = /user_auth="([a-zA-Z0-9]+)"/.exec(html);
        self.userAuth = match[1];
        resolve(match[1]);
    });
};

module.exports = HttpWrapper;
