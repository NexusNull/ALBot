
var reviving = false;
var targetMonster = "crab";

smart_move(targetMonster);
    setInterval(function () {

        if (character.rip && !reviving) {
            reviving = true;
            var position = {
                x: character.real_x,
                y: character.real_y,
                map: character.map,
            }
            setTimeout(function () {
                respawn();
                setTimeout(function () {
                    reviving = false;
                    smart_move(position);
                }, 1000)
            }, 12000)

        }

        if ((character.hp / character.max_hp <= .50) || (character.max_hp - character.hp > 200)) {
            use("hp");
        }

        if (character.mp / character.max_mp <= .40 || (character.max_mp - character.mp > 300)) {
            use("mp");
        }
        loot();


        let target;
        target = get_nearest_monster({type: targetMonster});
        change_target(target);
        if (target) {
            if (can_attack(target)) {
                attack(target);
            } else {
                move(target.real_x,target.real_y);
            }
        }
    }, 1000 / 4);