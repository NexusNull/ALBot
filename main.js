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

const child_process = require("child_process");
const HttpWrapper = require("./app/httpWrapper");
const BotWebInterface = require("bot-web-interface");
const fs = require("fs");
var userData = require("./userData.json");
var uiGenerator = require("./app/uiGenerator");


var activeChildren = {};


async function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}


class Game{
    constructor() {
        this.login = userData.login;
        this.bots = userData.bots;


    }
    async init(){


        if (userData.sessionData) {
            if (userData.sessionData !== "")
                this.httpWrapper = new HttpWrapper(userData.sessionData.sessionCookie);
            if (await this.httpWrapper.checkLogin()) {
            } else if (await this.httpWrapper.login(this.login.email, this.login.password)) {
                userData.sessionData.sessionCookie = this.httpWrapper.sessionCookie;
                fs.writeFileSync("./userData.json", JSON.stringify(userData, null, 4));
            } else {
                throw new Error("Login failed");
            }
        } else {
            this.httpWrapper = new HttpWrapper();
            await this.httpWrapper.login(this.login.email, this.login.password);
        }

        var characters = await this.httpWrapper.getCharacters();
        var userAuth = await this.httpWrapper.getUserAuth();
        var game_version = await this.httpWrapper.getGameVersion();

        await this.updateGameFiles();

        // starting pathfinding daemon
        let pathfinderProcess = null;
        if (userData.config.pathfinding && userData.config.pathfinding.activate) {
            pathfinderProcess = child_process.fork("./pathfinding/main", [userData.config.pathfinding.daemonPort], {
                stdio: [0, 1, 2, 'ipc'],
                execArgv: [
                    //'--inspect-brk',
                    //"--max_old_space_size=4096",
                ]
            });
        }

        if (userData.config.fetch) {
            console.log("Populating config file with data.");
            userData.bots = [];
            for (let i = 0; i < characters.length; i++) {
                userData.bots[i] = {
                    characterName: characters[i].name,
                    characterId: characters[i].id,
                    runScript: "default.js",
                    server: "US I",
                    enabled: false,
                }
            }
            userData.config.fetch = false;
            fs.writeFileSync("./userData.json", JSON.stringify(userData, null, 4));
            process.exit();
        }

        //Checking for mistakes in userData.json
        if (!this.bots) {
            console.error("Missing field \"bots\" in userData.json");
        }

        for (let i = 0; i < this.bots.length; i++) {
            if (!(this.bots[i] && this.bots[i].characterId && this.bots[i].runScript && this.bots[i].server && typeof this.bots[i].enabled === "boolean"))
                throw new Error("One or more necessary fields are missing from userData.json \n The following fields need to be present for a working executor:\n characterId runScript\n server\n enabled\n To fix this automatically simply set fetch: true in userdata.json");
        }

        //Reverse lookup name to characterId, names can't be used for starting a bot.
        for (let i = 0; i < this.bots.length; i++) {
            if (!this.bots[i].characterId) {
                for (let j = 0; j < characters.length; j++) {
                    if (this.bots[i].characterName === characters[j].name) {
                        this.bots[i].characterId = characters[j].id;
                    }
                }
            }
        }

        //Check that ids are unique, we don't want to start a bot twice.
        for (let i = 0; i < this.bots.length; i++) {
            if (this.bots[i])
                for (let j = i + 1; j < this.bots.length; j++) {
                    if (this.bots[j])
                        if (this.bots[i].characterId === this.bots[j].characterId) {
                            console.error("Duplicate characterId " + this.bots[i].characterId + " ignoring second declaration.");
                            this.bots[j] = null;
                        }
                }
        }

        let serverList = await this.httpWrapper.getServerList();
        if (userData.config.botWebInterface.start) {
            BotWebInterface.startOnPort(userData.config.botWebInterface.port);
            var password;
            if (userData.config.botWebInterface.password === "")
                password = null;
            else
                password = userData.config.botWebInterface.password;
            BotWebInterface.setPassword(password);
            BotWebInterface.SocketServer.getPublisher()
                .setDefaultStructure(uiGenerator.getDefaultStructure());
        }

        //Checks are done, starting bots.
        let botCount = 0;
        for (let i = 0; i < this.bots.length; i++) {
            if (!this.bots[i].enabled)
                continue;
            botCount++;
            //TODO fix for no online server
            let ip = null;
            let port = null;
            for (let j = 0; j < serverList.length; j++) {
                let server = serverList[j];
                if (this.bots[i].server === server.region + " " + server.name) {
                    ip = server.ip;
                    port = server.port;
                }
            }
            if (ip && port) {
                var args = [this.httpWrapper.sessionCookie, this.httpWrapper.userAuth, this.httpWrapper.userId, ip, port, this.bots[i].characterId, this.bots[i].runScript, userData.config.botKey];
                this.startGame(args);
            } else {
                console.warn("Couldn't find server: '" + this.bots[i].server + "'.");
            }
        }
        if (this.bots.length === 0) {
            console.warn("Couldn't find any bots to start you can set the fetch flag the pull all characters from the server.");
        } else if (botCount === 0) {
            console.warn("Couldn't find any bots to start, make sure the enable flag is set to true");
        }
    }

    startGame(args) {
        let childProcess = child_process.fork("./app/game", args, {
            stdio: [0, 1, 2, 'ipc'],
            execArgv: [
                //'--inspect-brk',
                //"--max_old_space_size=4096",
            ]
        });
        var data = {};
        var botInterface = BotWebInterface.SocketServer.getPublisher().createInterface();

        /**
         *
         * @type {Array<BotUI>}
         */
        botInterface.setDataSource(() => {
            return data;
        });

        childProcess.on('message', (m) => {
            if (m.type === "status" && m.status === "disconnected") {
                childProcess.kill();
                for (let i in activeChildren) {
                    if (activeChildren.hasOwnProperty(i) && activeChildren[i] === childProcess) {
                        activeChildren[i] = null;
                    }
                }
                BotWebInterface.SocketServer.getPublisher().removeInterface(botInterface);
                this.startGame(args);
            } else if (m.type === "albot_deploy") {
                if (m.overwrite) {
                    childProcess.kill();
                    for (var i in activeChildren) {
                        if (activeChildren.hasOwnProperty(i) && activeChildren[i] === childProcess) {
                            activeChildren[i] = null;
                        }
                    }
                    BotWebInterface.SocketServer.getPublisher().removeInterface(botInterface);
                }

                //var args = [httpWrapper.sessionCookie, httpWrapper.userAuth, httpWrapper.userId, ip, port, bots[i].characterId, bots[i].runScript, userData.config.botKey];
                //startGame();
                let newArgs = args.slice();
                if (m.ip)
                    newArgs[3] = m.ip;
                if (m.port)
                    newArgs[4] = m.port;
                if (m.character_id)
                    newArgs[5] = m.character_id;
                if (m.script)
                    newArgs[6] = m.script;
                this.startGame(newArgs);
            } else if (m.type === "bwiUpdate") {
                data = m.data;
            } else if (m.type === "bwiPush") {
                botInterface.pushData(m.name, m.data);
            } else if (m.type === "startupClient") {
                activeChildren[m.characterName] = childProcess;
            } else if (m.type === "send_cm") {
                if (activeChildren[m.characterName]) {
                    activeChildren[m.characterName].send({
                        type: "on_cm",
                        from: m.from,
                        data: m.data,
                    })
                } else {
                    childProcess.send({
                        type: "send_cm_failed",
                        characterName: m.characterName,
                        data: m.data,
                    });
                }
            }
        });
    }
    async updateGameFiles() {
        let success = false;
        while (!success) {
            try {
                let gameVersion = await this.httpWrapper.getGameVersion();
                if (!fs.existsSync("data/data." + gameVersion + ".json")) {
                    console.log("Detected version change, Updating game data");
                    let gameData = await this.httpWrapper.getGameData();
                    fs.writeFileSync("data/data." + gameVersion + ".json", JSON.stringify(gameData));
                    success = true;
                }
            } catch (e) {
                console.log("Fetch for game data failed trying again in 10 seconds", e);
                await sleep(10 * 1000);
            }
        }
    }
}



let game = new Game();
game.init();





