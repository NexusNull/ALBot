const fs = require("fs");
const path = require("path")
const gameFiles = [
    "/js/pixi/fake/pixi.min.js",
    "/js/libraries/combined.js",
    "/js/codemirror/fake/codemirror.js",
    "/js/common_functions.js",
    "/js/functions.js",
    "/js/game.js",
    "/js/html.js",
    "/js/payments.js",
    "/js/keyboard.js",
    "/data.js"
];

const runnerFiles = [
    "/js/common_functions.js",
    "/js/runner_functions.js",
    "/js/runner_compat.js"
];


class GameDataManager {
    constructor(httpWrapper) {
        this.httpWrapper = httpWrapper;
        this.versions = this.getAvailableVersions();

    }

    getAvailableVersions() {
        let files = fs.readdirSync("./data");
        let versions = [];
        for (let file of files) {
            if (file.startsWith("data"))
                versions.push(+file.split(".")[1])
        }
        return versions.sort((a, b) => b - a);
    }

    async updateGameData() {
        let gameVersion = await this.httpWrapper.getGameVersion();

        for (let gameFile of gameFiles) {
            let data = await this.httpWrapper.getFile(gameFile);
            let localPath = path.join("data", gameVersion, gameFile)
            fs.mkdirSync(path.parse(localPath).dir, {recursive: true})
            fs.writeFileSync(localPath, data)
        }

        for (let runnerFile of runnerFiles) {
            let data = await this.httpWrapper.getFile(runnerFile);
            let localPath = path.join("data", gameVersion, runnerFile)
            fs.mkdirSync(path.parse(localPath).dir, {recursive: true})
            fs.writeFileSync(localPath, data)
        }
    }

}

module.exports = GameDataManager;