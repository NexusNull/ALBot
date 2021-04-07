const Game = require("./Game");

async function sleep(ms) {
    return new Promise(function (res) {
        setTimeout(res, ms)
    })
}

class GameController {
    constructor(httpWrapper, serverList, gameDataManager, botWebInterface) {
        this.bots = new Map();
        this.serverList = serverList;
        this.httpWrapper = httpWrapper;
        this.gameDataManager = gameDataManager;
        this.botWebInterface = botWebInterface;
    }

    async startCharacter(characterId, server, runScript) {
        return new Promise(async (resolve, reject) => {
            let serverInfo = await this.serverList.getServerInfo(server);
            while (!serverInfo) {
                console.log(`Unable to find server: ${server}, retrying in 10 seconds`);
                await sleep(10000);
                serverInfo = await this.serverList.getServerInfo(server);
            }
            if (!serverInfo) {
                console.log("Server unavailable, retrying in 10 seconds")
                setTimeout(() => {
                    this.startCharacter(characterId, server, runScript)
                }, 10000);
                return;
            }
            let gameVersion = await this.httpWrapper.getGameVersion();
            if (gameVersion > this.gameDataManager.versions[0])
                await this.gameDataManager.updateGameData()
            const botUI = this.botWebInterface.publisher.createInterface();
            const game = new Game(this.httpWrapper.sessionCookie, serverInfo.ip, serverInfo.port, characterId, runScript, botUI);

            game.on("start", resolve);
            game.on("stop", () => {
                let data = this.bots.get(characterId);
                data.botUI.destroy();
                this.bots.delete(characterId);
                if (!data.stopping) {
                    console.log(`character: ${characterId} stopped unexpectedly, restarting ...`)
                    this.bots.delete(characterId);
                    setTimeout(() => {
                        this.startCharacter(characterId, server, runScript)
                    }, 1000);
                }
            })

            this.bots.set(characterId, {
                characterId,
                server,
                runScript,
                botUI,
                game: game,
                stopping: false,
            });
            game.start();
        })
    }

    async stopCharacter() {

    }


}

module.exports = GameController;