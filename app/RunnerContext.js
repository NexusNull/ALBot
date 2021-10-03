const Context = require("./Context")
const gameFiles = new (require("./GameFiles"))();
const vm = require("vm");


class RunnerContext extends Context {
    constructor(version, gameContext) {
        super(gameContext);
        this.version = version;



    }

    async init() {
        vm.runInContext("var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0,is_bot=parent.is_bot,is_cli=parent.is_cli;", this.context);

        const sources = gameFiles.runnerFiles
            .map(f => gameFiles.locate_game_file(f, this.version));
        for (let path of sources) {
            await this.evalFile(path);
        }
    }

    async run(fileName) {
        await this.evalFile(fileName)
        vm.runInContext("code_run=true;", this.context);
    }
}

module.exports = RunnerContext;