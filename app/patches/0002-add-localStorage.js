/**
 *
 * @param files
 */
function run(files) {
    files["/js/runner_functions.js"] =
        "{\n" +
        "    const LocalStorage = require(\"node-localstorage-sync\").LocalStorage;\n" +
        "    const localStorage = new LocalStorage('./app/localStorage');\n" +
        "    setInterval(localStorage.sync.bind(localStorage), 1000);\n" +
        "    Object.defineProperty(window, \"localStorage\", {\n" +
        "        get: () => {\n" +
        "            return localStorage;\n" +
        "        }\n" +
        "    })\n" +
        "}\n" + files["/js/runner_functions.js"]

}


module.exports = {run}