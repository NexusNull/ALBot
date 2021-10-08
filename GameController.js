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

    async startCharacter(characterId, server, runScript, characterName, gameVersion) {
        return new Promise(async (resolve) => {
            let serverInfo = await this.serverList.getServerInfo(server);
            while (!serverInfo) {
                console.log(`Unable to find server: ${server}, retrying in 10 seconds`);
                await sleep(10000);
                serverInfo = await this.serverList.getServerInfo(server);
            }
            let botUI = null;
            if (this.botWebInterface)
                botUI = this.botWebInterface.publisher.createInterface();
            const game = new Game(gameVersion, this.httpWrapper.sessionCookie, serverInfo.addr, serverInfo.port, characterId, runScript, botUI, characterName);

            game.on("start", resolve);
            game.on("stop", () => {
                let data = this.bots.get(characterId);
                if (data.botUI)
                    data.botUI.destroy();
                this.bots.delete(characterId);
                if (!data.stopping) {
                    console.log(`character: ${characterId} stopped unexpectedly, restarting ...`)
                    this.bots.delete(characterId);
                    setTimeout(() => {
                        this.startCharacter(characterId, server, runScript, characterName, gameVersion)
                    }, 1000);
                }
            });

            game.on("cm", (data) => {
                for (let [characterId, bot] of this.bots) {
                    if (bot.game.send_cm(data)) {
                        return;
                    }
                }
                game.send_cm_failed(data)
            })
            game.on("config", async (data) => {
                console.log(data)
                switch (data.type) {
                    case "switchServer":
                        await this.stopCharacter(characterId);
                        await this.startCharacter(characterId, data.server, runScript, characterName, gameVersion)
                        break;
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

    async stopCharacter(characterId) {
        return new Promise((resolve, reject) => {
            let bot = this.bots.get(characterId);
            bot.game.on("stop", resolve);
            bot.stopping = true;
            bot.game.stop();
        });
    }


}

module.exports = GameController;