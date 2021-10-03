const Context = require("./Context");
const gameFiles = new (require("./GameFiles"))();
const _fs = require('fs');
const io = require("socket.io-client");
const Extensions = require("./Extensions");
const path = require("path")

class GameContext extends Context {
    constructor(version) {
        super();
        this.version = version;
    }

    async init(realm_addr, realm_port, session, characterId) {
        const sources = gameFiles.gameFiles
            .map(f => gameFiles.locate_game_file(f, this.version))
            .concat(["./app/html_vars.js"]);
        this.context.io = io;
        this.context.bowser = {};
        for (let path of sources) {
            await this.evalFile(path);
        }
        this.context.VERSION = "" + this.context.G.version;
        this.context.server_addr = realm_addr;
        this.context.server_port = realm_port;
        this.context.user_id = session.split("-")[0];
        this.context.user_auth = session.split("-")[1];
        this.context.character_to_load = characterId;
        this.context.get_code_function = (f_name) => {
            for (let context of this.children) {
                if (context.context[f_name]) {
                    return context.context[f_name];
                }
            }
            return () => undefined;
        }
        this.context.get_code_file = (name_or_slot) => {
            if (typeof name_or_slot === "string") {
                let buffer;
                try {
                    buffer = _fs.readFileSync(path.join(__dirname, "../CODE/", name_or_slot));
                } catch (e) {
                    console.log("Unable to locate File");
                    console.log(path.join(__dirname, "../CODE/", name_or_slot))
                }

                if (buffer)
                    return buffer.toString();
            }
        }
        this.context.run_code = (code, onerror) => {
            if (typeof onerror != "function")
                onerror = (e) => undefined;
            try {
                this.children[0].eval(code)
            } catch (e) {
                try {
                    onerror(e);
                } catch (e) {
                    console.log(e)
                }
            }
        }
        const extensions = Extensions();
        this.context.caracAL = extensions;
        this.context.albot = extensions;
        let resolve, reject;
        const prom = new Promise((a, b) => {
            resolve = a;
            reject = b;
        });
        const old_game_logic = this.context.new_game_logic;
        this.context.new_game_logic = async () => {
            await old_game_logic();
            clearTimeout(extensions.reload_task);
            resolve();
        }

        const timeout = 10;
        extensions.reload_task = setTimeout(() => {
            console.log("game not loaded after " + timeout + " seconds, reloading");
            reject();
        }, timeout * 1000 + 100);

        const old_dc = this.context.disconnect;
        this.context.disconnect = () => {
            old_dc();
            extensions.relog();
        }


        this.eval("add_log = console.log");
        this.eval("the_game()");
        await prom;
        console.log("game instance constructed");
    }

}

module.exports = GameContext;