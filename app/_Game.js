const vm = require('vm');
const io = require("socket.io-client");
const fs = require('fs').promises;
const {JSDOM} = require("jsdom");
const node_query = require('jquery');
const gameFiles = new (require("./GameFiles"))();
const bwiUtil = require("./bwiUtil");

process.on('unhandledRejection', (exception) => {
    console.log("promise rejected: \n", exception);
});

const html_spoof = `<!DOCTYPE html>
<html>
<head>
<title>Adventure Land</title>
</head>
<body>
</body>
</html>`


class Game {
    constructor(version, realm_addr, realm_port, session, characterId, script_file) {
        this.version = version
        this.realm_addr = realm_addr
        this.realm_port = realm_port
        this.session = session
        this.characterId = characterId
        this.script_file = script_file

    }

    async make_runner(upper, CODE_file, version) {
        const runner_sources = gameFiles.runnerFiles.map(f =>
            gameFiles.locate_game_file(f, version))
            .concat([CODE_file]);
        console.log("constructing runner instance from sources");
        const runner_context = this.createContext(upper);
        vm.runInContext("var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0,is_bot=parent.is_bot,is_cli=parent.is_cli;", runner_context);
        await this.eval_files(runner_sources, runner_context);
        vm.runInContext("code_run=true;", runner_context);
        console.log("runner instance constructed");
        return runner_context;
    }

    async eval_files(locations, context) {
        for (let location of locations) {
            let text = await fs.readFile(location, 'utf8');
            vm.runInContext(text + "\n//# sourceURL=file://" + location, context);
        }
    }

    createContext(upper = null) {
        const result = new JSDOM(html_spoof,
            {url: "https://adventure.land/"}).window;
        result.$ = result.jQuery = node_query(result);
        result.require = require;
        if (upper) {
            Object.defineProperty(result, "parent", {value: upper});
        }
        vm.createContext(result);
        //TODO can i remove this with eval external option of jsdom?
        result.eval = (arg) => {
            return vm.runInContext(arg, result)
        };
        return result;
    }

    async init() {
        const game_sources = gameFiles.gameFiles.map(f =>
            gameFiles.locate_game_file(f, this.version))
            .concat(["./app/html_vars.js"]);
        const extensions = {};
        console.log("constructing game instance from sources:\n");
        const game_context = this.createContext();

        game_context.io = io;
        game_context.bowser = {};
        await this.eval_files(game_sources, game_context);
        game_context.VERSION = "" + game_context.G.version;
        game_context.server_addr = this.realm_addr;
        game_context.server_port = this.realm_port;
        game_context.user_id = this.session.split("-")[0];
        game_context.user_auth = this.session.split("-")[1];
        game_context.character_to_load = this.characterId;

        extensions.deploy = (char_name, realm = parent.server_region + parent.server_identifier) => null;
        extensions.shutdown = () => process.exit(0);
        extensions.relog = extensions.shutdown;
        extensions.send_cm = (receiver, data) => {
            process.send({type: "cm", data: {receiver: receiver, data: data}});
        }
        game_context.get_code_function = (f_name) => {
            return extensions.runner && extensions.runner[f_name] || function () {
            };
        }

        game_context.caracAL = extensions;
        game_context.albot = extensions;

        const old_game_logic = game_context.new_game_logic;
        game_context.new_game_logic = async () => {
            await old_game_logic();
            clearTimeout(extensions.reload_task);

            require("./uiGenerator").game_context = game_context;
            bwiUtil.registerListeners(game_context);

            extensions.runner = await this.make_runner(game_context, "./CODE/" + this.script_file, this.version);
        }

        const timeout = 10;
        extensions.reload_task = setTimeout(() => {
            console.log("game not loaded after " + timeout + " seconds, reloading");
            extensions.relog();
        }, timeout * 1000 + 100);

        const old_dc = game_context.disconnect;
        game_context.disconnect = () => {
            old_dc();
            extensions.relog();
        }

        process.on("message", (m) => {
            switch (m.type) {
                case "on_cm":
                    extensions.runner.character.trigger("cm", {
                        name: m.from,
                        message: m.data,
                        date: m.date,
                        local: true
                    });
                    break;
            }
        })

        vm.runInContext("add_log = console.log", game_context);
        vm.runInContext("the_game()", game_context);
        console.log("game instance constructed");
        return game_context;
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


