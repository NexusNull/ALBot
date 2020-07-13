/**
 * Created by nexus on 31/03/17.
 */
const PriorityQueue = require("./PriorityQueue");

function dist(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function aStar(start, end, map) {
    if (start === undefined || start === null) return null;
    if (end === undefined || end === null) return null;
    if (start.pos.x === end.pos.x && start.pos.y === end.pos.y) return [];
    debugger;
    var overlay = {};
    map.qtn.sort(function (a, b) {
        return dist(a, start.pos) - dist(b, start.pos);
    });
    var open = new PriorityQueue((a, b) => a.fCost < b.fCost);
    for (let i = 0; i < map.qtn.length; i++) {
        let node = map.qtn[i];
        if (map.canMoveTo(start.pos.x, start.pos.y, node.x, node.y)) {

            let g, h;
            let ele = {
                pos: {x: node.x, y: node.y},
                cameFrom: start,
                found: true,
                open: true,
                gCost: g = dist(start.pos, node),
                hCost: h = dist(node, end.pos),
                fCost: g + h,
            };
            open.push(ele);
            overlay[node.x + ":" + node.y] = ele;
            break;
        }
    }

    function getNeighbours(current) {
        let result = [];
        let neighbours = map.qtg[current.pos.x + ":" + current.pos.y];
        for (let pos of neighbours) {
            let node = overlay[pos.x + ":" + pos.y];
            if (node) {
                result.push(node);
            } else {
                let ele = {
                    pos: {x: pos.x, y: pos.y}
                };
                result.push(ele);
                overlay[pos.x + ":" + pos.y] = ele;
            }
        }
        return result;
    }

    function getNodePath() {
        var path = [{x: end.pos.x, y: end.pos.y}];
        var current = end;
        while (current.cameFrom !== undefined) {
            current = current.cameFrom;
            path.splice(0, 0, {x: current.pos.x, y: current.pos.y});
        }
        return path;
    }

    let iter = 0;
    var found = false;
    while (!open.isEmpty() && !found) {
        iter++;
        let current = open.pop();
        current.open = false;
        if (map.canMapMoveTo(current.pos.x, current.pos.y, end.pos.x, end.pos.y)) {
            found = true;
            console.log("Found a path in " + iter + " steps.");
            end.cameFrom = current;
            return getNodePath();
        } else {
            let nodes = getNeighbours(current);
            for (let id in nodes) {
                let node = nodes[id];
                if (!node.found) {
                    node.found = true;
                    node.open = true;
                    node.hCost = dist(node.pos, end.pos);
                    node.gCost = dist(current.pos, node.pos) + current.gCost;
                    node.fCost = node.gCost + node.hCost;
                    node.cameFrom = current;
                    open.push(node)
                } else {
                    if (!node.open)
                        continue;
                    let gCost = dist(current.pos, node.pos) + current.gCost;
                    if (gCost < node.gCost) {
                        node.gCost = gCost;
                        node.fCost = node.gCost + node.hCost;
                        node.cameFrom = current;
                    }
                }

            }
        }
    }

    console.log("No path to end Found");
    return null;
}

/**
 * @param {number} mapX
 * @param {number} mapY
 * @param {Map} map
 * @returns {Node}
 */
function getClosestWalkableNode(mapX, mapY, map) {
    var x = Math.floor((mapX - map.position.x) / map.boxSize);
    var y = Math.floor((mapY - map.position.y) / map.boxSize);

    function getRectangle(x, y, size, map) {
        var result = [];
        if (size == 0) {
            return [map.get(x, y)];
        }
        //Top Horizontal Row
        var top = y - size;
        for (var i = x - size; i <= x + size; i++) {
            result.push(map.get(i, top))
        }
        //Top Bottom Row
        var bottom = y + size;
        for (var j = x - size; j <= x + size; j++) {
            result.push(map.get(j, bottom))
        }
        //Left Vertical Row
        var left = x - size;
        for (var k = y - size + 1; k <= y + size - 1; k++) {
            result.push(map.get(left, k))
        }
        //Right Vertical Row
        var right = x + size;
        for (var l = y - size + 1; l <= y + size - 1; l++) {
            result.push(map.get(right, l))
        }
        return result;
    }

    var size = 0;
    var closest = null;
    var closestDis = Infinity; //Contains Distance squared
    while (closestDis > size) {
        var nodes = getRectangle(x, y, size, map);
        for (var i in nodes) {
            if (nodes[i] && nodes[i].cost >= 1) {
                var node = nodes[i];
                var dist = Math.sqrt((node.pos.x - x) * (node.pos.x - x) + (node.pos.y - y) * (node.pos.y - y));
                if (dist < closestDis) {
                    closest = node;
                    closestDis = dist;
                }
            }
        }
        size++;
    }
    return closest;
}

function findPath(startX, startY, endX, endY, map) {
    var path = [];

    var start = getClosestWalkableNode(startX, startY, map);
    var end = getClosestWalkableNode(endX, endY, map);

    var aStarPath = aStar(start, end, map);
    if (aStarPath) {
        for (var i = 0; i < aStarPath.length; i++) {
            path.push(map.toGameMapCoordinates(aStarPath[i]));
        }
        return path;
    } else
        return null;
}

module.exports = {findPath: findPath};
