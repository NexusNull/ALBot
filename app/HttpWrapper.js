/**
 * Created by nexus on 15/05/17.
 */
const glob_config = require("../Config");
const axios = require("axios");
const FormData = require('form-data');
const base_url = glob_config.config.config.baseUrl || "https://adventure.land";

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
        let form = new FormData();
        form.append("method", "signup_or_login")
        form.append("arguments", '{"email":"' + email + '","password":"' + password + '","only_login":true}')
        let response = await axios.post(base_url + "/api/signup_or_login", form, {
            timeout: 2000,
            headers: form.getHeaders()
        });

        let data = response.data;
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
        return loginSuccessful;


    };

    async getServersAndCharacters() {
        let form = new FormData();
        form.append("method", "servers_and_characters")
        form.append("arguments", '{}');
        let response = await axios.post(base_url + "/api/servers_and_characters", form, {
            timeout: 2000,
            headers: Object.assign(form.getHeaders(), {cookie: "auth=" + this.sessionCookie})
        });
        let data = response.data[0];
        if (data.type === "servers_and_characters")
            return data;
        else
            throw new Error("Not logged in")
    };

    async checkLogin() {
        return new Promise(async (resolve) => {
            console.log("check Login:");
            const form = new FormData();
            form.append("method", "servers_and_characters")
            form.append("arguments", '{}');
            const response = await axios.post(base_url + "/api/servers_and_characters", form, {
                timeout: 2000,
                headers: Object.assign(form.getHeaders(), {cookie: "auth=" + this.sessionCookie})
            });

            const data = response.data[0];
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
        return (await axios.get(base_url + "/" + path, {headers: {"cookie": "auth=" + this.sessionCookie}})).data
    };

    async getGameVersion() {
        const response = await axios.get(base_url, {
            headers: {
                "cookie": "auth=" + this.sessionCookie,
            }
        });
        const match = /src="\/js\/game\.js\?v=([0-9]+)"/.exec(response.data);
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
