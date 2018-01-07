/**
 * Created by Nexus on 26.07.2017.
 */
var fs = require("fs")


var Executor = function(glob,file){
    var self = this;
    var parent = {};
    var character = {};
    var G = {};
    var active=false,catch_errors=true,is_code=1,is_server=0,is_game=0;

    eval(fs.readFileSync('modedGameFiles/common_functions.js')+'');
    eval(fs.readFileSync('modedGameFiles/runner_functions.js')+'');
    this.callbacks = {};

    parent = glob;
    character = glob.character;
    G = glob.G;

    this.execute = function(){
        console.log("Executing "+file);
        eval(fs.readFileSync('CODE/'+file)+'');

        // This exports scoped functions to the game object,
        // sadly this is the way to go because we don't have a window object.
        Object.defineProperties(self.callbacks,{
            handle_death:{get: () => handle_death},
            handle_command:{get: () => handle_command},
            on_cm:{get: () => on_cm},
            on_disappear:{get: () => on_disappear},
            on_combined_damage:{get: () => on_combined_damage},
            on_party_invite:{get: () => on_party_invite},
            on_party_request:{get: () => on_party_request},
            on_destroy:{get: () => on_destroy},
            on_draw:{get: () => on_draw},
            on_game_event:{get: () => on_game_event},
        });
    }
};


module.exports = Executor;