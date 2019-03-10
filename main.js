process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log(exception.stack);

});

var child_process = require("child_process");
var HttpWrapper = require("./httpWrapper");
var httpWrapper = new HttpWrapper();
var BotWebInterface = require("bot-web-interface");
var fs = require("fs");
var userData = require("./userData.json");
var login = userData.login;
var bots = userData.bots;

async function main() {
    var result = await httpWrapper.login(login.email, login.password);
    var characters = await httpWrapper.getCharacters();
    var userAuth = await httpWrapper.getUserAuth();

    if (!result)
        throw new Error("Login failed");

    if (userData.config.fetch) {
        console.log("Populating config file with data.");
        userData.bots = [];
        for (let i = 0; i < characters.length; i++) {
            console.log(characters[i]);
            userData.bots[i] = {
                characterName: characters[i].name,
                characterId: characters[i].id,
                runScript: "default.js",
                server: "US I"
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
        if (!(bots[i] && bots[i].characterId && bots[i].runScript && bots[i].server))
            throw new Error("One or more necessary fields are missing from userData.json \n The following fields need to be present for a working executor:\n characterId runScript\n server\n");
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
        BotWebInterface.SocketServer.getPublisher().setStructure([
            {name: "name", type: "text", label: "name"},
            {name: "inv", type: "text", label: "Inventory"},
            {name: "level", type: "text", label: "Level"},
            {name: "gold", type: "text", label: "Gold"},
            {name: "xp", type: "progressBar", label: "Experience", options: {color: "green"}},
            {name: "health", type: "progressBar", label: "Health", options: {color: "red"}},
            {name: "mana", type: "progressBar", label: "Mana", options: {color: "blue"}},
            {name: "target", type: "text", label: "Target"},
            {name: "status", type: "text", label: "Status"},
            {name: "dps", type: "text", label: "Damage/s"},
            {name: "gph", type: "text", label: "Gold/h"},
            {name: "xpph", type: "text", label: "XP/h"},
            {name: "tlu", type: "text", label: "TLU"},
            {name: "minimap", type: "image", label: "Minimap", options: {width: 376, height: 200}}
        ]);
    }

    //Checks are done, starting bots.
    for (let i = 0; i < bots.length; i++) {
        let ip = "54.169.213.59";
        let port = 8090;
        for (let j = 0; j < serverList.length; j++) {
            let server = serverList[j];
            if (bots[i].server === server.region + " " + server.name) {
                ip = server.ip;
                port = server.port;
            }
        }
        var args = [httpWrapper.sessionCookie, httpWrapper.userAuth, httpWrapper.userId, ip, port, bots[i].characterId, bots[i].runScript, userData.config.botKey];
        startGame(args);
    }
}

var activeChildren = {};

function startGame(args) {
    let childProcess = child_process.fork("./game", args, {
        stdio: [0, 1, 2, 'ipc'],
        execArgv: [
            //"--max_old_space_size=4096",
            //'--inspect-brk'
        ]
    });
    var data = {};
    var botInterface = BotWebInterface.SocketServer.getPublisher().createInterface();
    botInterface.setDataSource(() => {
        return data;
    });
    childProcess.on('message', (m) => {
        if (m.type === "status" && m.status === "disconnected") {
            childProcess.kill();
            for (var i in activeChildren) {
                if (activeChildren[i] == childProcess) {
                    activeChildren[i] = null;
                }
            }
            BotWebInterface.SocketServer.getPublisher().removeInterface(botInterface);
            startGame(args);
        } else if (m.type === "bwiUpdate") {
            data = m.data;
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

async function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

main();





