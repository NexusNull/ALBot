/**
 * Created by Nexus on 26.07.2017.
 */
var fs = require("fs")




var Executor = function(global){
    var parent = {};
    var character = {};
    var G = {};
    var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0;

    eval(fs.readFileSync('modedGameFiles/common_functions.js')+'');
    eval(fs.readFileSync('modedGameFiles/runner_functions.js')+'');

    parent = global;
    character = global.character;
    G = global.G;

    this.execute = function(){
        eval(fs.readFileSync('modedGameFiles/gameCode.js')+'');
    }
}

module.exports = Executor;