/**
 *
 * @param files
 */
function run(files) {
    const safeCopy = files["/js/runner_functions.js"];
    let success = true;

    let tmp = files["/js/runner_functions.js"];

    tmp = tmp.split("data[2]=new Date(data[2]);\n\t\t\t\tmessages.push(data);")
    if (tmp.length === 2) {
        tmp = tmp.join("if(data){\n\t\t\t\t\tdata[2]=new Date(data[2]);\n\t\t\t\t\tmessages.push(data);\t\t\t\n}")
    } else success = false;

    tmp = tmp.split("var keys=Object.keys(localStorage);")
    if (tmp.length === 2) {
        tmp = tmp.join("var keys=localStorage._keys")
    } else success = false;

    if (success) {
        console.error("Unable to find correct needle, aborting ...");
        files["/js/runner_functions.js"] = safeCopy;
    } else{
        files["/js/runner_functions.js"] = tmp;
    }
}


module.exports = {run}