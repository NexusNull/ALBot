/**
 *
 * @param files
 */
function run(files) {
    files["/js/runner_functions.js"] =
        "{\n" +
        "    const LocalStorage = require(\"node-localstorage-sync\").LocalStorage;\n" +
        "    const sessionStorage = new LocalStorage('./app/sessionStorage');\n" +
        "    setInterval(sessionStorage.sync.bind(sessionStorage), 1000);\n" +
        "    Object.defineProperty(window, \"sessionStorage\", {\n" +
        "        get: () => {\n" +
        "            return sessionStorage;\n" +
        "        }\n" +
        "    })\n" +
        "}\n" + files["/js/runner_functions.js"]

}


module.exports = {run}