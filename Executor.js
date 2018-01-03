/**
 * Created by Nexus on 26.07.2017.
 */
var fs = require("fs");
var vm = require("vm");

var common_functions =fs.readFileSync('modedGameFiles/common_functions.js')+'\n';
var runner_functions =fs.readFileSync('modedGameFiles/runner_functions.js')+'\n';



var Executor = function(glob,file){

    var intervals = [];
    var timeouts = [];

    var sandbox = {
        global:global,
        character: glob.character,
        G:glob.G,
        active:false,
        catch_errors:true,
        is_code:1,
        is_server:0,
        is_game:0,
        parent:glob,
        console:console,
        setInterval:function () {
            //console.log("Register Interval")
            intervals.push(setInterval.apply(null, arguments));
        },
        setTimeout:function () {
            //console.log("Register Timeout")
            timeouts.push(setTimeout.apply(null, arguments));
        }
    };
    vm.createContext(sandbox);
    glob.sandbox = sandbox;

    var script = new vm.Script(common_functions+runner_functions+fs.readFileSync('CODE/'+file)+'');

    this.execute = function(){
        console.log("Executing "+file);
        glob.code_active = true;
        try {
            script.runInNewContext(sandbox);
        } catch(error){
            console.log(error)
        }
    };

    this.stop = function(){
        glob.code_active = false;
        intervals.forEach(clearInterval);
        timeouts.forEach(clearTimeout);
    }
}

module.exports = Executor;