const Game = require("./Game");

class GameController {
    constructor(serverList, session) {
        this.bots = new Map();
        this.serverList = serverList;
        this.session = session;
    }

    async startCharacter(characterId, server, runScript) {
        return new Promise(async (resolve, reject) => {
            let serverInfo = await this.serverList.getServerInfo(server);
            const game = new Game(this.session, serverInfo.ip, serverInfo.port, characterId, runScript, 0);
            game.on("start", resolve)
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