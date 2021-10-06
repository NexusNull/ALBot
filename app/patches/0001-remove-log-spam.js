/**
 *
 * @param files
 */
function run(files) {
    let haystack = files["/js/common_functions.js"].split("console.error(\"Weird resolve_deferred issue: \"+name),console.log(\"If you emit socket events manually, ignore this message\");")
    if (haystack.length === 2) {
        files["/js/common_functions.js"] = haystack.join(";")
    } else {
        throw new Error("Unable to find correct needle, aborting ...")
    }

    haystack = files["/js/common_functions.js"].split("console.error(\"Weird reject_deferred issue: \"+name),console.log(\"If you emit socket events manually, ignore this message\");")
    if (haystack.length === 2) {
        files["/js/common_functions.js"] = haystack.join(";")
    } else {
        throw new Error("Unable to find correct needle, aborting ...")
    }

}


module.exports = {run}