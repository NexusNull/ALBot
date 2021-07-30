const EventSystem = require("./EventSystem");
const child_process = require("child_process");

class Game extends EventSystem {
    constructor(version, session, ip, port, characterId, runScript, botUI, characterName) {
        super();
        this.process = null;
        this.version = version;
        this.session = session;
        this.ip = ip;
        this.port = port;
        this.characterId = characterId;
        this.runScript = runScript;
        this.botUI = botUI;
        this.characterName = characterName;

    }

    start() {
        let data = {};
        const args = [this.version, this.session, this.ip, this.port, this.characterId, this.runScript];
        this.process = child_process.fork("./app/_Game", args, {
            stdio: [0, 1, 2, 'ipc'],
            execArgv: [
                //'--inspect-brk',
                //"--max_old_space_size=4096",
            ]
        });
        if (this.botUI) {
            this.botUI.setDataSource(() => {
                return data;
            });
        }

        this.process.on("message", (m) => {
            switch (m.type) {
                case "bwiUpdate":
                    data = m.data;
                    break;
                case "bwiPush":
                    if (this.botUI)
                        this.botUI.pushData(m.name, m.data);
                    break;
                case "send_cm":
                    this.emit("cm", m)
                    break;
            }
        });
        this.process.on("exit", () => {
            this.emit("stop");
        })

    }

    send_cm(data) {
        if (data.characterName === this.characterName) {
            this.process.send({
                type: "on_cm",
                from: data.from,
                data: data.data,

            })
            return true;
        }
        return false;
    }

    send_cm_failed(data) {
        this.process.send({
            type: "send_cm_failed",
            characterName: data.characterName,
            data: data.data,
        });
    }

    stop() {
        if (this.process)
            this.process.exit(1);
    }
}

module.exports = Game;