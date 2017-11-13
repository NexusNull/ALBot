/**
 * Created by nexus on 15/05/17.
 */
var cheerio = require("cheerio");
var request = require("request-promise-native");
/**
 *
 * @constructor
 */
var HttpWrapper = function () {
    this.sessionCookie = "";
    this.userAuth = "";
    this.userId = 0;
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
            await request({url: "http://adventure.land"});
        } catch (e) {
            reject("could not fetch index.html on login." + err);
        }
        try {
            await request.post(
                {
                    url: "http://adventure.land/api/signup_or_login",
                    formData: {
                        arguments: '{"email":"' + email + '","password":"' + password + '"}',
                        method: "signup_or_login"
                    },
                    headers: {
                        "x-requested-with": "XMLHttpRequest",
                        "Accept": "application/json, text/javascript, */*; q=0.01",
                        "user-agent": "AdventureLandBot: (v1.0.0)",
                    }
                }, function (err, response, html) {
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
                    }
                    resolve(loginSuccessful);
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
        var html = await request({url: "http://adventure.land", headers: {cookie: "auth=" + self.sessionCookie}});
        var $ = cheerio.load(html);

        let menu = $(".loginorselection>.menu>.gamebutton");
        for (let i = 0; i < (menu.length - 1); i++) {
            let element = menu[i];
            if (element.name == "div") {

                let characterId = /log_in.*'(\d*)'/.exec(element.attribs.onclick)[1];
                let characterName = element.children[2].data.toString().replace(/\t/g, "").replace(/\n/g, "");
                let characterLevel = parseInt(element.children[6].data.toString().replace(/\t/g, "").replace(/\n/g, "").replace("Lv.", ""));
                let characterClass = element.children[7].children[0].data;
                let characterStatus = element.children[3].children[0].data;

                characters.push({
                    name: characterName,
                    id: characterId,
                    level: characterLevel,
                    class: characterClass,
                    status: characterStatus
                });

            }
        }
        resolve(characters);
    })
};

HttpWrapper.prototype.getServerList = async function () {

};

HttpWrapper.prototype.checkLogin = async function () {

};

HttpWrapper.prototype.getUserAuth = async function () {
    var self = this;
    return new Promise(async function (resolve, reject) {
        var html = await request({
            url: "http://adventure.land/",
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

HttpWrapper.prototype.checkIn = function (ip, port, ipass, characterId) {
    var callbackId = Math.round(Math.random() * 100000000000 + 12007144706612636761);
    var callbackStart = Math.round(Math.random() * 10000) + 1494359179004;
    var callbackCount = callbackStart + 1;
    setInterval(async function(){
        callbackCount++;
        var options = {
            url: 'http://' + ip + ':' + (+port + 40) + '/character?checkin=1&ipass=' + ipass + '&id=' + characterId + '&callback=jQuery' + callbackId + '_' + callbackStart + '&_=' + callbackCount
        };
        await request(options);
    },30000);
};

module.exports = HttpWrapper;
