const config = require("./Config");
const GameController = require("./GameController")
const HttpWrapper = require("./app/HttpWrapper")
const ServerList = require("./ServerList")

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

async function main() {
    config.validate();
    let httpWrapper = new HttpWrapper();
    let session = config.getSession();
    if (session && session !== "") {
        httpWrapper.setSession(session);
    }
    if (!await httpWrapper.checkLogin()) {
        let login = config.getLogin();
        let loggedIn = await httpWrapper.login(login.email, login.password);
        if (loggedIn) {
            const session = httpWrapper.sessionCookie;
            config.setSession(session);
        } else {
            console.error("Unable to log in, aborting ...")
            process.exit(1);
        }
    }

    console.log("Starting characters");
    let bots = config.getBots();
    let serverList = new ServerList(httpWrapper);
    let gameController = new GameController(serverList, httpWrapper.sessionCookie);
    let promises = [];
    for (let bot of bots) {
        promises.push(gameController.startCharacter(bot.characterId, bot.server, bot.runScript))
    }
    await Promise.all(promises);
    setTimeout(()=>{},10000000)
}

main();