const GameContext = require('./GameContext');
const RunnerContext = require('./RunnerContext');
const bwiUtil = require("./bwiUtil");

process.on('unhandledRejection', (exception) => {
    console.log("promise rejected: \n", exception);
});


class Game {
    constructor(version, realm_addr, realm_port, session, characterId, script_file) {
        this.version = version
        this.realm_addr = realm_addr
        this.realm_port = realm_port
        this.session = session
        this.characterId = characterId
        this.script_file = script_file

        this.gameContext = new GameContext(this.version);
        this.runnerContext = new RunnerContext(this.version, this.gameContext);

    }

    async init() {
        try {
            await this.gameContext.init(this.realm_addr, this.realm_port, this.session, this.characterId);
        } catch (e) {
            process.exit();
        }
        await this.runnerContext.init();
        await this.runnerContext.run("./CODE/" + this.script_file)

        bwiUtil.registerListeners(this.gameContext.context);

        process.on("message", (m) => {
            switch (m.type) {
                case "on_cm":
                    if (this.runnerContext.context && this.runnerContext.context.character)
                        this.runnerContext.context.character.trigger("cm", {
                            name: m.from,
                            message: m.data,
                            date: m.date,
                            local: true
                        });
                    break;
            }
        })

    }
}

{
    let args = process.argv.slice(2);
    const version = args[0];
    const sess = args[1];
    const realm_addr = args[2];
    const realm_port = args[3];
    const cid = args[4];
    const script_file = args[5];
    (new Game(version, realm_addr, realm_port, sess, cid, script_file)).init();
}


