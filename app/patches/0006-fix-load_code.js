


function run(files) {
    let asd = files["/js/runner_functions.js"].split("\tvar library=document.createElement(\"script\");\n" +
        "\tlibrary.type=\"text/javascript\";\n" +
        "\tlibrary.text=code;\n" +
        "\tlibrary.onerror=onerror||function(){ game_log(\"load_code: Failed to load\",colors.code_error); };\n" +
        "\tdocument.getElementsByTagName(\"head\")[0].appendChild(library);")
    if (asd.length === 2) {
        files["/js/runner_functions.js"] = asd.join("parent.run_code(code, onerror)")
    } else {
        console.error("Unable to find correct needle, aborting ...")
    }
}


module.exports = {run}