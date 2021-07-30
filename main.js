const config = require("./Config");
const GameController = require("./GameController")
const HttpWrapper = require("./app/HttpWrapper")
const ServerList = require("./ServerList")
const GameDataManager = require("./GameDataManager")
const BotWebInterface = require("bot-web-interface");
const uiGenerator = require("./app/uiGenerator");
const Pathfinding = require("./pathfinding/Pathfinding");
const fs = require("fs");
const path = require("path");


process.on('uncaughtException', function (exception) {
    console.log("Uncaught Exception");
    console.log(exception);
    console.log(exception.stack);
    process.exit(-1);
});

process.on('unhandledRejection', function (exception) {
    console.log("Unhandled Rejection");
    console.log(exception);
    console.log(exception.stack);
    process.exit(-1);
});


class ALBot {
    constructor() {
        this.httpWrapper = new HttpWrapper();
        this.serverList = new ServerList(this.httpWrapper);
        this.gameDataManager = new GameDataManager(this.httpWrapper);
        this.botWebInterface = null;
        this.gameController = null;
        this.currentGameVersion = null;
    }

    async start() {
        config.validate();
        if (config.config.config.botWebInterface && config.config.config.botWebInterface.enabled) {
            this.botWebInterface = new BotWebInterface({
                port: config.config.config.botWebInterface.port,
                password: (config.config.config.botWebInterface.password ? config.config.config.botWebInterface.password : null)
            });
            this.botWebInterface.publisher.setDefaultStructure(uiGenerator.getDefaultStructure());
        }
        this.gameController = new GameController(this.httpWrapper, this.serverList, this.gameDataManager, this.botWebInterface);

        let session = config.getSession();
        if (session && session !== "") {
            this.httpWrapper.setSession(session);
        }

        if (!await this.httpWrapper.checkLogin()) {
            let login = config.getLogin();
            let loggedIn = await this.httpWrapper.login(login.email, login.password);
            if (loggedIn) {
                const session = this.httpWrapper.sessionCookie;
                config.setSession(session);
            } else {
                console.error("Unable to log in, aborting ...")
                process.exit(1);
            }
        }

        if (config.isFetch()) {
            console.log("Populating config file with data.");
            const characters = await this.httpWrapper.getCharacters();
            let bots = [];
            for (let char of characters) {
                bots.push({
                    characterName: char.name,
                    characterId: char.id,
                    runScript: "default.js",
                    server: "US I",
                    enabled: false,
                })
            }
            config.setBots(bots)
            config.toggleFetch();
            process.exit();
        }

        if (config.isPathfinding()) {
            let pathFinding = new Pathfinding();
            await pathFinding.start();
        }

        // clear session Storage
        let files = [];
        do {
            files = fs.readdirSync("app/sessionStorage");
            for (let file of files) {
                fs.unlinkSync(path.join(__dirname, "app/sessionStorage", file))
            }
        } while (files.length !== 0)

        console.log("Starting characters");
        let bots = config.getBots();

        let promises = [];
        for (let bot of bots) {
            promises.push(this.gameController.startCharacter(bot.characterId, bot.server, bot.runScript, bot.characterName, this.currentGameVersion))
        }
        await Promise.all(promises);
    }

    async houseKeeping() {
        if (!await this.gameDataManager.isUpToDate()) {
            let gameVersion = await this.gameDataManager.updateGameData();
            await this.findRunningVersion();
            this.currentGameVersion = gameVersion;
        } else {
            this.currentGameVersion = await this.gameDataManager.currentVersion();
        }
    }

    async findRunningVersion(gameVersion) {
        if (typeof gameVersion === "undefined")
            gameVersion = Number.MAX_SAFE_INTEGER;
        let gameVersions = this.gameDataManager.getAvailableVersions().filter((elem) => elem < gameVersion);
        if (gameVersions.length == 0) {
            console.error("No runnable version detected, stopping")
            process.exit(0)
        } else {
            gameVersion = gameVersions[0]
        }
        try {
            await this.gameDataManager.applyPatches(gameVersion);
        } catch (e) {
            if (e.code === "PATCH_FAIL") {
                console.error(e.message)
                await this.findRunningVersion(gameVersion);
            } else {
                throw e;
            }
            return;
        }
        this.currentGameVersion = gameVersion;
    }
}

async function main() {
    const albot = new ALBot();
    await albot.houseKeeping();
    await albot.start();
    setInterval(() => {
        albot.houseKeeping();
    }, 1000 * 60)
}

main();