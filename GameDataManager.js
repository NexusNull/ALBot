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
    "/data.js",
    "/js/common_functions.js",
    "/js/runner_functions.js",
    "/js/runner_compat.js"
];

class GameDataManager {
    constructor(httpWrapper) {
        this.httpWrapper = httpWrapper;
        this.currentGameVersion = -1
        this.lastUpdated = 0;
    }

    async currentVersion() {
        if (this.lastUpdated < Date.now() - 60 * 1000) {
            this.lastUpdated = Date.now();
            let version = 0;
            do {
                try {
                    version = await this.httpWrapper.getGameVersion();
                } catch (e) {
                    console.log(e);
                    await sleep(15000);
                }
            } while (!version)
            this.currentGameVersion = version;
        } else {
            return this.currentGameVersion;
        }
    }

    async isUpToDate() {
        const versions = this.getAvailableVersions();
        let gameVersion = await this.currentVersion();
        return versions.includes(gameVersion);

    }

    getAvailableVersions() {
        let files = fs.readdirSync("./data", {withFileTypes: true});
        let versions = [];
        for (let file of files) {
            if (file.isDirectory())
                versions.push(+file.name)
        }
        return versions.sort((a, b) => b - a).map((a) => "" + a);
    }

    async updateGameData() {
        let gameVersion = await this.currentVersion();

        for (let gameFile of gameFiles) {
            let data = await this.httpWrapper.getFile(gameFile);
            let localPath = path.join("data", "" + gameVersion, gameFile)
            fs.mkdirSync(path.parse(localPath).dir, {recursive: true})
            fs.writeFileSync(localPath, data)
        }
        return gameVersion;
    }

    async readPatches(gameVersion) {
        let localPath = path.join("data", "" + gameVersion, "/patches.json")
        let patches = [];
        try {
            patches = JSON.parse(fs.readFileSync(localPath).toString());
        } catch (e) {
            if (e.code !== "ENOENT")
                throw e;
        }
        return patches;
    }

    async writeAppliedPatches(gameVersion, patches) {
        let localPath = path.join("data", "" + gameVersion, "/patches.json")
        fs.writeFileSync(localPath, JSON.stringify(patches))
    }

    async readFiles(gameVersion) {
        let files = {};

        for (let gameFile of gameFiles) {
            let localPath = path.join("data", "" + gameVersion, gameFile)
            files[gameFile] = fs.readFileSync(localPath).toString();
        }
        return files;
    }

    async writeFiles(files, gameVersion) {
        for (let filePath in files) {
            let localPath = path.join("data", "" + gameVersion, filePath)
            fs.writeFileSync(localPath, files[filePath]);
        }
        return files;
    }

    async applyPatches(gameVersion) {
        let patches = fs.readdirSync("app/patches");
        let appliedPatches = await this.readPatches(gameVersion);
        let files = await this.readFiles(gameVersion);
        console.log("Applying patches to " + gameVersion);
        let failed = false;
        for (let patchPath of patches) {
            if (failed)
                break;
            let patch = require("./" + path.join("app/patches/", patchPath));
            try {
                if (!appliedPatches.includes(patchPath)) {
                    console.log("    " + patchPath);
                    patch.run(files);
                    appliedPatches.push(patchPath);
                }
            } catch (e) {
                console.error("Failed to execute patch '" + patchPath + "'");
                console.error(e);
                failed = true;
            }
        }
        if (failed) {
            let error = new Error("Unable to apply all patches to game version:" + gameVersion);
            error.code = "PATCH_FAIL";
            throw error;
        }
        await this.writeAppliedPatches(gameVersion, appliedPatches)
        await this.writeFiles(files, gameVersion)


    }
}

module.exports = GameDataManager;