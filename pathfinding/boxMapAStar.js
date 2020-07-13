/**
 * Created by nexus on 31/03/17.
 */
const PriorityQueue = require("./PriorityQueue");

function dist(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function aStar(startBoxId, endBoxId, map) {
    if (startBoxId === endBoxId) return [];

    let startBox = map.boxes[startBoxId];
    let endBox = map.boxes[endBoxId];

    if(!startBox){
        console.log(startBoxId);
    }
    if(!endBox){
        console.log(endBoxId);
    }

    endBox.pos = {
        x: Math.floor(endBox.x + endBox.size.x / 2),
        y: Math.floor(endBox.y + endBox.size.y / 2)
    };
    var overlay = {};

    var open = new PriorityQueue((a, b) => a.fCost < b.fCost);
    let g, h, pos;
    let node = {
        pos: pos = {
            x: Math.floor(startBox.x + startBox.size.x / 2),
            y: Math.floor(startBox.y + startBox.size.y / 2)
        },
        boxId: startBoxId,
        cameFrom: null,
        found: true,
        open: true,
        gCost: g = 0,
        hCost: h = dist(pos, endBox.pos),
        fCost: g + h,
    };

    open.push(node);
    overlay[startBoxId] = node;

    function getNeighbours(current) {
        let result = [];
        let neighbors = map.boxes[current.boxId].neighbors;
        for (let boxId of neighbors) {
            let node = overlay[boxId];
            if (node) {
                result.push(node);
            } else {

                let node = {
                    boxId: boxId,
                    box: map.boxes[boxId]
                };
                result.push(node);
                overlay[boxId] = node;
            }
        }
        return result;
    }

    function getNodePath() {
        var path = [];
        var current = endBox;
        while (current.cameFrom !== null) {
            current = current.cameFrom;
            path.push(current.boxId);
        }

        return path.reverse();
    }

    let iter = 0;
    var found = false;
    while (!open.isEmpty() && !found) {
        iter++;
        let current = open.pop();
        current.open = false;
        if (current.boxId === endBoxId) {
            found = true;
            endBox.cameFrom = current;
            return getNodePath();
        } else {
            let nodes = getNeighbours(current);
            for (let node of nodes) {
                if (!node.found) {
                    let pos = {
                        x: Math.floor(node.box.x + node.box.size.x / 2),
                        y: Math.floor(node.box.y + node.box.size.y / 2)
                    };
                    node.pos = pos;
                    node.found = true;
                    node.open = true;
                    node.hCost = dist(pos, endBox.pos);
                    node.gCost = dist(current.pos, pos) + current.gCost;
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
    var x = Math.floor((mapX - map.offset.x) / map.keenness);
    var y = Math.floor((mapY - map.offset.y) / map.keenness);

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

    let startBoxId = map.meshes.boxMap[startX + startY * map.size.x];
    let endBoxId = map.meshes.boxMap[endX + endY * map.size.x];

    var aStarPath = aStar(startBoxId, endBoxId, map);
    if (aStarPath) {
        return aStarPath;
    } else
        return null;
}

function findPathFromBox(startBoxId, endBoxId, map) {
    if (startBoxId === undefined || startBoxId === null || startBoxId === 0) return null;
    if (endBoxId === undefined || endBoxId === null || endBoxId === 0) return null;

    var aStarPath = aStar(startBoxId, endBoxId, map);
    if (aStarPath) {
        return aStarPath;
    } else
        return null;
}

module.exports = {findPath, findPathFromBox};
