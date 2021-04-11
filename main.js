const config = require("./Config");
const GameController = require("./GameController")
const HttpWrapper = require("./app/HttpWrapper")
const ServerList = require("./ServerList")
const GameDataManager = require("./GameDataManager")
const BotWebInterface = require("bot-web-interface");
const uiGenerator = require("./app/uiGenerator");
const Pathfinding = require("./pathfinding/Pathfinding");


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

        console.log("Starting characters");
        let bots = config.getBots();

        let promises = [];
        for (let bot of bots) {
            promises.push(this.gameController.startCharacter(bot.characterId, bot.server, bot.runScript))
        }
        await Promise.all(promises);
    }
}

const albot = new ALBot();
albot.start();