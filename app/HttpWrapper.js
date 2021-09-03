/**
 * Created by nexus on 15/05/17.
 */
const request = require("request-promise-native");
const vm = require('vm');
const glob_config = require("../Config");
const base_url = glob_config.config.baseUrl || "https://adventure.land";

/**
 *
 * @constructor
 */
class HttpWrapper {
    constructor() {
        this.sessionCookie = "";

    }

    setSession(session) {
        this.sessionCookie = session;
    }

    /**
     *
     * @param email
     * @param password
     * @return {Object}
     */
    async login(email, password) {
        console.log("Logging in.");
        return new Promise(async (resolve, reject) => {
            try {
                await request({url: base_url});
            } catch (err) {
                reject("could not fetch index.html on login." + err);
            }
            try {
                await request.post(
                    {
                        url: base_url+"/api/signup_or_login",
                        formData: {
                            arguments: '{"email":"' + email + '","password":"' + password + '","only_login":true}',
                            method: "signup_or_login"
                        },
                        headers: {
                            "x-requested-with": "XMLHttpRequest",
                            "Accept": "application/json, text/javascript, */*; q=0.01",
                        }
                    }, (err, response, html) => {
                        if (err) {
                            console.error("Error login in:");
                            console.error(err);
                            process.exit(1)
                        } else {
                            let data = JSON.parse(html);
                            let loginSuccessful = false;
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
                                        this.sessionCookie = match[1];
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

    async getCharacters() {
        return new Promise(async (resolve) => {
            var html = await request.post({
                url: base_url+"/api/servers_and_characters",
                headers: {cookie: "auth=" + this.sessionCookie},
                formData: {method: "servers_and_characters", arguments: "{}"}
            });
            let data = JSON.parse(html)[0];
            resolve(data.characters);
        })
    };

    async getServersAndCharacters() {
        return new Promise(async (resolve) => {
            var html = await request.post({
                url: base_url+"/api/servers_and_characters",
                headers: {cookie: "auth=" + this.sessionCookie},
                formData: {method: "servers_and_characters", arguments: "{}"}
            });
            let data = JSON.parse(html)[0];
            resolve(data);
        })
    };

    async checkLogin() {
        return new Promise(async (resolve) => {
            console.log("check Login:");
            var html = await request.post({
                url: base_url+"/api/servers_and_characters",
                headers: {cookie: "auth=" + this.sessionCookie},
                formData: {method: "servers_and_characters", arguments: "{}"}
            });
            let data = JSON.parse(html)[0];
            if (data.args && data.args[0] === "Not logged in.") {
                console.log("not logged in");
                resolve(false);
            } else if (data.type && data.type === "servers_and_characters") {
                console.log("logged in");
                resolve(true);
            }
            resolve(false);
        })
    };

    async getFile(path) {
        return new Promise(async (resolve, reject) => {
            try {
                let code = await request({
                    url: base_url+"/" + path,
                    headers: {
                        "x-requested-with": "XMLHttpRequest",
                        "Accept": "application/json, text/javascript, */*; q=0.01",
                        "cookie": "auth=" + this.sessionCookie,
                    }
                });
                resolve(code);
            } catch (e) {
                reject("Could not retrieve game data");
            }
        });
    };

    async getGameVersion(force) {
        var html = await request({
            url: base_url,
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "cookie": "auth=" + this.sessionCookie,
            }
        });
        var match = /src="\/js\/game\.js\?v=([0-9]+)"/.exec(html);
        return match[1];
    };

    getUserId() {
        if (this.sessionCookie)
            return this.sessionCookie.split("-")[0];
        throw new Error("Not logged in")
    }

    getUserAuth() {
        if (this.sessionCookie)
            return this.sessionCookie.split("-")[1];
        throw new Error("Not logged in")
    };
}

module.exports = HttpWrapper;
