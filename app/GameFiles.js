const fs = require("fs").promises;

class GameFiles {
    constructor() {
        this.runnerFiles = [
            "/js/common_functions.js",
            "/js/runner_functions.js",
            "/js/runner_compat.js"
        ]
        this.gameFiles = [
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
        ]
    }

    locate_game_file(resource, version) {
        return `./data/${version}${resource}`;
    }

    async available_versions() {
        return (await fs.readdir("./data",
            {withFileTypes: true}))
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(x => x.match(/^\d+$/))
            .map(x => parseInt(x))
            .sort().reverse();
    }
}

module.exports = GameFiles;