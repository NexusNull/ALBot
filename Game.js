const EventSystem = require("./EventSystem");
const child_process = require("child_process");

class Game extends EventSystem {
    constructor(session, ip, port, characterId, runScript, botKey) {
        super();
        this.process = null;
        this.session = session;
        this.ip = ip;
        this.port = port;
        this.characterId = characterId;
        this.runScript = runScript;
        this.botKey = botKey;
    }

    start() {
        const args = [this.session, this.ip, this.port, this.characterId, this.runScript];
        this.process = child_process.fork("./app/game", args, {
            stdio: [0, 1, 2, 'ipc'],
            execArgv: [
                //'--inspect-brk',
                //"--max_old_space_size=4096",
            ]
        });
        this.process.on("message", (m) => {

        })
        this.process.on("exit", (code) => {
            this.emit("stop");
        })

    }

    stop() {
        if (this.process)
            this.process.exit(1);
    }
}

module.exports = Game;