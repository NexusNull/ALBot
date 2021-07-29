const fs = require("fs");


/**
 *
 * @param files
 */
function run(files) {
    files["/js/runner_functions.js"] =
        "{\n" +
        "    const LocalStorage = require(\"node-localstorage\").LocalStorage;\n" +
        "    const sessionStorage = new LocalStorage('./app/sessionStorage');\n" +
        "    Object.defineProperty(window, \"sessionStorage\", {\n" +
        "        get: () => {\n" +
        "            return sessionStorage;\n" +
        "        }\n" +
        "    })\n" +
        "}\n" + files["/js/runner_functions.js"]

}


module.exports = {run}