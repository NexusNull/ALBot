const Game = require("./Game");

class GameController {
    constructor(httpWrapper, serverList, gameDataManager) {
        this.bots = new Map();
        this.serverList = serverList;
        this.httpWrapper = httpWrapper;
        this.gameDataManager = gameDataManager;
    }

    async startCharacter(characterId, server, runScript) {
        return new Promise(async (resolve, reject) => {
            let serverInfo = await this.serverList.getServerInfo(server);
            let gameVersion = await this.httpWrapper.getGameVersion();
            if (gameVersion > this.gameDataManager.versions[0])
                await this.gameDataManager.updateGameData()
            const game = new Game(this.httpWrapper.sessionCookie, serverInfo.ip, serverInfo.port, characterId, runScript, 0);
            game.on("start", resolve);
            this.bots.set(characterId, {
                characterId,
                server,
                runScript,
                game: game
            });
            game.start();
        })
    }

    async stopCharacter() {

    }


}

module.exports = GameController;