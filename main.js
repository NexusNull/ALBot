process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log(exception.stack);
});

var child_process = require("child_process");
var HttpWrapper = require("./app/httpWrapper");
var BotWebInterface = require("bot-web-interface");
var fs = require("fs");
var userData = require("./userData.json");
var uiGenerator = require("./app/uiGenerator");
var login = userData.login;
var bots = userData.bots;

async function main() {

    var httpWrapper;
    if (userData.sessionData) {
        if (userData.sessionData !== "")
            httpWrapper = new HttpWrapper(userData.sessionData.sessionCookie);
        if (await httpWrapper.checkLogin()) {
        } else if (await httpWrapper.login(login.email, login.password)) {
            userData.sessionData.sessionCookie = httpWrapper.sessionCookie;
            fs.writeFileSync("./userData.json", JSON.stringify(userData, null, 4));
        } else {
            throw new Error("Login failed");
        }
    } else {
        httpWrapper = new HttpWrapper();
        await httpWrapper.login(userData.login.email, userData.login.password);
    }
    var characters = await httpWrapper.getCharacters();
    var userAuth = await httpWrapper.getUserAuth();
    var game_version = await httpWrapper.getGameVersion();

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
    if (!bots) {
        console.error("Missing field \"bots\" in userData.json");
    }

    for (let i = 0; i < bots.length; i++) {
        if (!(bots[i] && bots[i].characterId && bots[i].runScript && bots[i].server && typeof bots[i].enabled === "boolean"))
            throw new Error("One or more necessary fields are missing from userData.json \n The following fields need to be present for a working executor:\n characterId runScript\n server\n enabled\n To fix this automatically simply set fetch: true in userdata.json");
    }

    //Reverse lookup name to characterId, names can't be used for starting a bot.
    for (let i = 0; i < bots.length; i++) {
        if (!bots[i].characterId) {
            for (let j = 0; j < characters.length; j++) {
                if (bots[i].characterName === characters[j].name) {
                    bots[i].characterId = characters[j].id;
                }
            }
        }
    }

    //Check that ids are unique, we don't want to start a bot twice.
    for (let i = 0; i < bots.length; i++) {
        if (bots[i])
            for (let j = i + 1; j < bots.length; j++) {
                if (bots[j])
                    if (bots[i].characterId === bots[j].characterId) {
                        console.error("Duplicate characterId " + bots[i].characterId + " ignoring second declaration.");
                        bots[j] = null;
                    }
            }
    }

    let serverList = await httpWrapper.getServerList();
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
    for (let i = 0; i < bots.length; i++) {
        if (!bots[i].enabled)
            continue;
        botCount++;
        //TODO fix for no online server
        let ip = null;
        let port = null;
        for (let j = 0; j < serverList.length; j++) {
            let server = serverList[j];
            if (bots[i].server === server.region + " " + server.name) {
                ip = server.ip;
                port = server.port;
            }
        }
        if (ip && port) {
            var args = [httpWrapper.sessionCookie, httpWrapper.userAuth, httpWrapper.userId, ip, port, bots[i].characterId, bots[i].runScript, userData.config.botKey];
            startGame(args);
        } else {
            console.warn("Couldn't find server: '" + bots[i].server + "'.");
        }
    }
    if (bots.length === 0) {
        console.warn("Couldn't find any bots to start you can set the fetch flag the pull all characters from the server.");
    } else if (botCount === 0) {
        console.warn("Couldn't find any bots to start, make sure the enable flag is set to true");
    }
}

var activeChildren = {};

function startGame(args) {
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
            for (var i in activeChildren) {
                if (activeChildren.hasOwnProperty(i) && activeChildren[i] === childProcess) {
                    activeChildren[i] = null;
                }
            }
            BotWebInterface.SocketServer.getPublisher().removeInterface(botInterface);
            startGame(args);
        } else if (m.type === "albot_deploy") {
            if(m.overwrite)
            {
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
            if(m.ip)
                newArgs[3]=m.ip;
            if(m.port)
                newArgs[4]=m.port;
            if(m.character_id)
                newArgs[5]=m.character_id;
            if(m.script)
                newArgs[6]=m.script;
            startGame(newArgs);
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

main();





