const EventSystem = require("../EventSystem");
const child_process = require("child_process");

class Pathfinding extends EventSystem {
    constructor() {
        super();
        this.process = null;

    }

    async start() {
        return new Promise((resolve) => {
            const args = [this.session, this.ip, this.port, this.characterId, this.runScript];
            this.process = child_process.fork("./pathfinding/_Pathfinding", args, {
                stdio: [0, 1, 2, 'ipc'],
                execArgv: [
                    //'--inspect-brk',
                    //"--max_old_space_size=4096",
                ]
            });

            this.process.on("exit", (code) => {
                this.emit("stop");
            })

            this.process.on("message", (m) => {
                switch (m) {
                    case "ready": {
                        console.log("pathfinding ready");
                        resolve();
                    }
                }
            });
        })
    }

    async stop() {
        if (this.process)
            this.process.exit(1);
    }

    async restart() {
        await stop();
        await start();
    }
}

module.exports = Pathfinding;