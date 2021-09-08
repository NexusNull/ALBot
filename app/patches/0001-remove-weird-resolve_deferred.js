/**
 *
 * @param files
 */
function run(files) {
    let asd = files["/js/common_functions.js"].split("console.error(\"Weird resolve_deferred issue: \"+name),console.log(\"If you emit socket events manually, ignore this message\");")
    if (asd.length === 2) {
        files["/js/common_functions.js"] = asd.join(";")
    } else {
        console.error("Unable to find correct needle, aborting ...")
    }
}


module.exports = {run}