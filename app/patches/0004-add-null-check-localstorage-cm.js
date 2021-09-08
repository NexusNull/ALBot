/**
 *
 * @param files
 */
function run(files) {
    let asd = files["/js/runner_functions.js"].split("data[2]=new Date(data[2]);\n\t\t\t\tmessages.push(data);")
    if (asd.length === 2) {
        files["/js/runner_functions.js"] = asd.join("if(data){data[2]=new Date(data[2]);\n\t\t\t\tmessages.push(data);}")
    } else {
        console.error("Unable to find correct needle, aborting ...")
    }
}


module.exports = {run}