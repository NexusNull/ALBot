const vm = require("vm");
const node_query = require('jquery');
const {JSDOM} = require("jsdom");
const fs = require('fs').promises;

const htmlSpoof = `<!DOCTYPE html>
<html>
<head>
<title>Adventure Land</title>
</head>
<body>
</body>
</html>`

class Context {
    constructor(upperContext = null) {
        this.children = [];
        this.parent = null;

        const pre_context = new JSDOM(htmlSpoof, {url: "https://adventure.land/"}).window
        pre_context.$ = node_query(pre_context)
        pre_context.jQuery = node_query(pre_context);
        pre_context.require = require;

        if (upperContext && upperContext instanceof Context) {
            upperContext.addChild(this)
            this.parent = upperContext;
            Object.defineProperty(pre_context, "parent", {value: upperContext.context});
        }

        pre_context.eval = (arg) => {
            return vm.runInContext(arg, pre_context)
        };

        this.context = vm.createContext(pre_context);
    }

    addChild(context) {
        this.children.push(context);
    }

    eval(code) {
        vm.runInContext(code, this.context);
    }

    async evalFile(path) {
        if(typeof path != "string")
            throw new Error()
        let text = await fs.readFile(path, 'utf8');
        vm.runInContext(text + "\n//# sourceURL=file://" + path, this.context);
    }
}

module.exports = Context;