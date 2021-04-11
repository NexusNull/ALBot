const fs = require("fs");

class UserData {
    constructor() {
        this.config = this.readConfig();
    }

    validate() {
        // check some common mistakes that can happen when you manually edit the config,
        // nothing special just helping out new users
        if (!this.config.bots) {
            console.error("Missing field \"bots\" in userData.json");
            if (!this.config.config.fetch)
                return false;
        }

        if (!this.config.login || !this.config.login.email || !this.config.login.password) {
            console.error("Missing Login Information");
            return false;
        }
        let botCount = 0;
        for (let i = 0; i < this.config.bots.length; i++) {
            if (!(this.config.bots[i] && this.config.bots[i].characterId && this.config.bots[i].runScript && this.config.bots[i].server && typeof this.config.bots[i].enabled === "boolean")) {
                console.error("One or more necessary fields are missing from userData.json \nThe following fields need to be present for a working executor:\n  characterId\n  runScript\n  server\n  enabled\nTo fix this automatically simply set fetch: true in userdata.json");
                return false;
            }
            if (this.config.bots[i].enabled)
                botCount++;
        }

        if (this.config.bots.length === 0) {
            console.warn("Couldn't find any bots to start you can set the fetch flag the pull all characters from the server.");
        }
        if (botCount === 0) {
            console.warn("Couldn't find any bots to start, make sure the enable flag is set to true");
        } else if (botCount > 4) {
            console.warn("You are starting more 4 than bots at once, this will lead to your characters getting disconnected Please refer to http://adventure.land/docs/guide/limits");
        }
    }

    getBots() {
        let bots = [];
        for (let i = 0; i < this.config.bots.length; i++) {
            if (this.config.bots[i].enabled) {
                bots.push(this.config.bots[i]);
            }
        }
        return bots;
    }

    isFetch() {
        return this.config.config.fetch;
    }

    toggleFetch() {
        this.config.config.fetch = !this.config.config.fetch;
        this.writeConfig(this.config);
    }

    setBots(bots) {
        this.config.bots = bots
        this.writeConfig(this.config);
    }

    getLogin() {
        return Object.assign({}, this.config.login)
    }

    getSession() {
        return this.config.login.session;
    }

    setSession(session) {
        this.config.login.session = session;
        this.writeConfig(this.config);
    }

    readConfig() {
        const text = fs.readFileSync("userData.json").toString("utf8");
        return JSON.parse(text);
    }

    writeConfig(data) {
        let json = JSON.stringify(data, null, 4);
        fs.writeFileSync("userData.json", json)
    }

    isPathfinding() {
        return this.config.config.pathfinding.enabled;
    }
}

module.exports = new UserData();
