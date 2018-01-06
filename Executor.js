/**
 * Created by Nexus on 26.07.2017.
 */
var fs = require("fs")


var Executor = function(glob,file){
    var parent = {};
    var character = {};
    var G = {};
    var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0;

    eval(fs.readFileSync('modedGameFiles/common_functions.js')+'');
    eval(fs.readFileSync('modedGameFiles/runner_functions.js')+'');

    parent = glob;
    character = glob.character;
    G = glob.G;
    this.execute = function(){
        console.log("Executing "+file);
        eval(fs.readFileSync('CODE/'+file)+'');
    }
}


module.exports = Executor;