var attack_mode=true

setInterval(function(){

    if ((character.hp / character.max_hp <= .20) || (character.max_hp - character.hp > 200)) {
        use("hp");
    }

    if (character.mp / character.max_mp <= .20  || (character.max_mp - character.mp > 300)) {
        use("mp");
    }

    loot();

    if(!attack_mode || is_moving(character)) return;

    var target=get_targeted_monster();
    if(!target)
    {
        target=get_nearest_monster({min_xp:100,max_att:120});
        if(target) change_target(target);
        else
        {
            set_message("No Monsters");
            return;
        }
    }

    if(!in_attack_range(target))
    {
        move(
            character.real_x+(target.real_x-character.real_x)/2,
            character.real_y+(target.real_y-character.real_y)/2
        );
        // Walk half the distance
    }
    else if(can_attack(target))
    {
        set_message("Attacking");
        attack(target);
    }

},1000/4); // Loops every 1/4 seconds.

// NOTE: If the tab isn't focused, browsers slow down the game
// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
