


function run(files) {
    let asd = files["/js/runner_functions.js"].split("localStorage.setItem(\"cm_\"+name+\"_\"+randomStr(20),JSON.stringify([character.name,data,new Date(),++local_m_num]));")
    if (asd.length === 2) {
        files["/js/runner_functions.js"] = asd.join("parent.albot.send_cm(name, [character.name,data,new Date(),++local_m_num])")
    } else {
        console.error("Unable to find correct needle, aborting ...")
    }
}


module.exports = {run}