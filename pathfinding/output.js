const pngUtil = require("../app/pngUtil.js");
var fs = require('fs'),
    PNG = require('pngjs').PNG;
var colors = [[128, 0, 0], [139, 0, 0], [165, 42, 42], [178, 34, 34], [220, 20, 60], [255, 0, 0], [255, 99, 71], [255, 127, 80], [205, 92, 92], [240, 128, 128], [233, 150, 122], [250, 128, 114], [255, 160, 122], [255, 69, 0], [255, 140, 0], [255, 165, 0], [255, 215, 0], [184, 134, 11], [218, 165, 32], [238, 232, 170], [189, 183, 107], [240, 230, 140], [128, 128, 0], [255, 255, 0], [154, 205, 50], [85, 107, 47], [107, 142, 35], [124, 252, 0], [127, 255, 0], [173, 255, 47], [0, 100, 0], [0, 128, 0], [34, 139, 34], [0, 255, 0], [50, 205, 50], [144, 238, 144], [152, 251, 152], [143, 188, 143], [0, 250, 154], [0, 255, 127], [46, 139, 87], [102, 205, 170], [60, 179, 113], [32, 178, 170], [47, 79, 79], [0, 128, 128], [0, 139, 139], [0, 255, 255], [0, 255, 255], [224, 255, 255], [0, 206, 209], [64, 224, 208], [72, 209, 204], [175, 238, 238], [127, 255, 212], [176, 224, 230], [95, 158, 160], [70, 130, 180], [100, 149, 237], [0, 191, 255], [30, 144, 255], [173, 216, 230], [135, 206, 235], [135, 206, 250], [25, 25, 112], [0, 0, 128], [0, 0, 139], [0, 0, 205], [0, 0, 255], [65, 105, 225], [138, 43, 226], [75, 0, 130], [72, 61, 139], [106, 90, 205], [123, 104, 238], [147, 112, 219], [139, 0, 139], [148, 0, 211], [153, 50, 204], [186, 85, 211], [128, 0, 128], [216, 191, 216], [221, 160, 221], [238, 130, 238], [255, 0, 255], [218, 112, 214], [199, 21, 133], [219, 112, 147], [255, 20, 147], [255, 105, 180], [255, 182, 193], [255, 192, 203], [250, 235, 215], [245, 245, 220], [255, 228, 196], [255, 235, 205], [245, 222, 179], [255, 248, 220], [255, 250, 205], [250, 250, 210], [255, 255, 224], [139, 69, 19], [160, 82, 45], [210, 105, 30], [205, 133, 63], [244, 164, 96], [222, 184, 135], [210, 180, 140], [188, 143, 143], [255, 228, 181], [255, 222, 173], [255, 218, 185], [255, 228, 225], [255, 240, 245], [250, 240, 230], [253, 245, 230], [255, 239, 213], [255, 245, 238], [245, 255, 250], [112, 128, 144], [119, 136, 153], [176, 196, 222], [230, 230, 250], [255, 250, 240], [240, 248, 255], [248, 248, 255], [240, 255, 240], [255, 255, 240], [240, 255, 255], [255, 250, 250], [105, 105, 105], [128, 128, 128], [169, 169, 169], [192, 192, 192], [211, 211, 211], [220, 220, 220], [245, 245, 245], [255, 255, 255]];

function draw_funny_boxes(map) {
    var png = new PNG({
        width: map.size.x,
        height: map.size.y,
        filterType: -1
    });
    try {
        for (let j = 0; j < map.meshes.base.length; j++) {
            if (map.meshes.base[j] == 0) {
                let idx = j << 2;
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
                png.data[idx + 3] = 255;
            } else {
                let idx = j << 2;
                png.data[idx] = 255;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 255;
                png.data[idx + 3] = 255;
            }
        }


        for (let j = 0; j < map.meshes.boxMap.length; j++) {
            if (map.meshes.boxMap[j] !== 0) {
                let color = colors[(map.meshes.boxMap[j] - 1) % (colors.length - 1)];
                let idx = j << 2;
                png.data[idx] = color[0];
                png.data[idx + 1] = color[1];
                png.data[idx + 2] = color[2];
                png.data[idx + 3] = 255;
            } else {
                let idx = j << 2;
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
                png.data[idx + 3] = 255;
            }
        }

        for (let j = 0; j < map.qtn.length; j++) {
            let node = map.qtn[j];
            if (map.qtg[node.x + ":" + node.y]) {
                for (let edge of map.qtg[node.x + ":" + node.y]) {
                    pngUtil.draw_line(node.x, node.y, edge.x, edge.y, png, [255, 0, 0, 255])
                }
            }
        }

    } catch (e) {
        console.error(e)
    }
    let buffer = PNG.sync.write(png);
    fs.writeFileSync('./pathfinding/boxMaps/' + map.name+".png", buffer);

}

function draw_funny_lines({boxMap, size, map, qtn, qtg, filename}) {
    var png = new PNG({
        width: size.x,
        height: size.y,
        filterType: -1
    });
    try {

        for (let j = 0; j < map.length; j++) {
            if (map[j] == 0) {
                let idx = j << 2;
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
                png.data[idx + 3] = 255;
            } else {
                let idx = j << 2;
                png.data[idx] = 255;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 255;
                png.data[idx + 3] = 255;
            }
        }

        for (let j = 0; j < qtn.length; j++) {
            let node = qtn[j];
            pngUtil.draw_dot(node.x, node.y, 1, png, [255, 0, 0, 255])
        }

        for (let j = 0; j < qtn.length; j++) {
            let node = qtn[j];
            if (qtg[node.x + ":" + node.y]) {
                for (let edge of qtg[node.x + ":" + node.y]) {
                    pngUtil.draw_line(node.x, node.y, edge.x, edge.y, png, [255, 0, 0, 255])
                }
            }
        }


        console.log("Done " + filename + ".png");

    } catch (e) {
        console.error(e)
    }

    let buffer = PNG.sync.write(png);
    fs.writeFileSync('./maps/' + filename, buffer);

}



function draw_base(array, size) {
    var png = new PNG({
        width: size.x,
        height: size.y,
        filterType: -1
    });
    try {
        let idx = 0;
        for (let j = 0; j < size.y; j++) {
            for (let i = 0; i < size.x; i++) {
                if (array[i + size.x * j] === 1) {
                    png.data[idx] = 255;
                    png.data[idx + 1] = 255;
                    png.data[idx + 2] = 255;
                    png.data[idx + 3] = 255;
                } else if (array[i + size.x * j] === 2) {
                    png.data[idx] = 125;
                    png.data[idx + 1] = 125;
                    png.data[idx + 2] = 125;
                    png.data[idx + 3] = 255;
                } else {
                    png.data[idx] = 0;
                    png.data[idx + 1] = 0;
                    png.data[idx + 2] = 0;
                    png.data[idx + 3] = 255;
                }
                idx = idx + 4;
            }
        }
    } catch (e) {
        console.log(e);
    }
    return png;
}

function draw_lines(png, map){
    let x_lines = map.optimizedLines.x_lines;
    for(let line of x_lines){
        pngUtil.draw_line((line[0]-map.offset.x)/map.keenness,(line[1]-map.offset.y)/map.keenness,(line[0]-map.offset.x)/map.keenness,(line[2]-map.offset.y)/map.keenness,png,[225,0,0,255])
    }
    let y_lines = map.optimizedLines.y_lines;
    for(let line of y_lines){
        pngUtil.draw_line((line[1]-map.offset.x)/map.keenness,(line[0]-map.offset.y)/map.keenness,(line[2]-map.offset.x)/map.keenness,(line[0]-map.offset.y)/map.keenness,png,[225,0,0,255])
    }
    return png;
}


function save(png, filename){
    let buffer = PNG.sync.write(png);
    fs.writeFileSync('./pathfinding/maps/' + filename, buffer);
}


function draw_box_path({boxMap, size, map, qtn, qtg, filename, path}) {
    var fs = require('fs'),
        PNG = require('pngjs').PNG;

    var png = new PNG({
        width: size.x,
        height: size.y,
        filterType: -1
    });
    try {
        for (let j = 0; j < boxMap.length; j++) {
            if (boxMap[j] !== 0) {
                let position = path.indexOf(boxMap[j]);
                if (position !== -1) {
                    let color = colors[position % (colors.length - 1)];
                    let idx = j << 2;
                    png.data[idx] = color[0];
                    png.data[idx + 1] = color[1];
                    png.data[idx + 2] = color[2];
                    png.data[idx + 3] = 255;
                } else {
                    let idx = j << 2;
                    png.data[idx] = 100;
                    png.data[idx + 1] = 100;
                    png.data[idx + 2] = 100;
                    png.data[idx + 3] = 255;
                }
            } else {
                let idx = j << 2;
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
                png.data[idx + 3] = 255;
            }
        }

        console.log("Done " + filename + ".png");

    } catch (e) {
        console.error(e)
    }

    let buffer = PNG.sync.write(png);
    fs.writeFileSync('./maps/' + filename, buffer);

}

module.exports = {draw_funny_boxes, draw_funny_lines, draw_box_path, draw_base, save,draw_lines};
