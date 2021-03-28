const fs = require("fs");

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
        let data = await this.httpWrapper.getGameData();
        let gameVersion = await this.httpWrapper.getGameVersion();
        fs.writeFileSync("./data/data." + gameVersion + ".json", JSON.stringify(data));
    }

}

module.exports = GameDataManager;