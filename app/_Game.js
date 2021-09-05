const vm = require('vm');
let io = require("socket.io-client");
const fs = require('fs').promises;
const {JSDOM} = require("jsdom");
const node_query = require('jquery');
const gameFiles = new (require("./GameFiles"))();
const bwiUtil = require("./bwiUtil");

process.on('unhandledRejection', function (exception) {
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
    constructor() {


    }

    async make_runner(upper, CODE_file, version) {
        const runner_sources = gameFiles.runnerFiles.map(f =>
            gameFiles.locate_game_file(f, version))
            .concat([CODE_file]);
        console.log("constructing runner instance from sources:\n");
        const runner_context = this.make_context(upper);
        vm.runInContext("var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0,is_bot=parent.is_bot,is_cli=parent.is_cli;", runner_context);
        await this.ev_files(runner_sources, runner_context);
        vm.runInContext("code_run=true;", runner_context);
        console.log("runner instance constructed");
        return runner_context;
    }

    async ev_files(locations, context) {
        for (let location of locations) {
            let text = await fs.readFile(location, 'utf8');
            vm.runInContext(text + "\n//# sourceURL=file://" + location, context);
        }
    }

    make_context(upper = null) {
        const result = new JSDOM(html_spoof,
            {url: "https://adventure.land/"}).window;
        result.$ = result.jQuery = node_query(result);
        result.require = require;
        if (upper) {
            Object.defineProperty(result, "parent", {value: upper});
        }
        vm.createContext(result);
        //TODO can i remove this with eval external option of jsdom?
        result.eval = function (arg) {
            return vm.runInContext(arg, result)
        };
        return result;
    }

    async make_game(version, addr, port, sess, cid, script_file) {
        const game_sources = gameFiles.gameFiles.map(f =>
            gameFiles.locate_game_file(f, version))
            .concat(["./app/html_vars.js"]);
        console.log("constructing game instance from sources:\n");
        const game_context = this.make_context();
        game_context.io = io;
        game_context.bowser = {};
        await this.ev_files(game_sources, game_context);
        game_context.VERSION = "" + game_context.G.version;
        game_context.server_addr = addr;
        game_context.server_port = port;
        game_context.user_id = sess.split("-")[0];
        game_context.user_auth = sess.split("-")[1];
        game_context.character_to_load = cid;

        const extensions = {};
        extensions.deploy = (char_name, realm = parent.server_region + parent.server_identifier) => null;
        extensions.shutdown = () => process.exit(0);
        extensions.relog = extensions.shutdown;
        game_context.get_code_function = function(f_name) {
            return extensions.runner && extensions.runner[f_name] || function(){};
        }
        game_context.caracAL = extensions;

        const old_ng_logic = game_context.new_game_logic;
        game_context.new_game_logic = async () => {
            old_ng_logic();
            clearTimeout(extensions.reload_task);

            require("./uiGenerator").game_context = game_context;
            bwiUtil.registerListeners(game_context);

            extensions.runner = await this.make_runner(game_context, "./CODE/" + script_file, version);
        }
        const old_dc = game_context.disconnect;
        game_context.disconnect = () => {
            old_dc();
            extensions.relog();
        }

        vm.runInContext("add_log = console.log", game_context);

        //If you are having trouble with socket.io try this!
        //vm.runInContext("mode.log_calls=true;mode.log_incoming=true;", game_context);


        vm.runInContext("the_game()", game_context);
        const timeout = 10;
        extensions.reload_task = setTimeout(() => {
            console.log("game not loaded after "+timeout+" seconds, reloading");
            extensions.relog();
        }, timeout*1000+100);
        console.log("game instance constructed");
        return game_context;
    }

    async main() {
        let args = process.argv.slice(2);
        const version = args[0];
        const sess = args[1];
        const realm_addr = args[2];
        const realm_port = args[3];
        const cid = args[4];
        const script_file = args[5];
        const upgrade_socket_io = args[6];
        if(upgrade_socket_io !== "undefined") {
            io = require("socket.io-client-new");
        }
        await this.make_game(version, realm_addr, realm_port, sess, cid, script_file);
    }

}

(new Game).main();



