class Floor {
    constructor(mapData, keenness) {
        this.name = mapData.name
        this.mapData = mapData;
        this.size = {
            x: Math.ceil((this.mapData.geometry.max_x - this.mapData.geometry.min_x + 1) / keenness),
            y: Math.ceil((this.mapData.geometry.max_y - this.mapData.geometry.min_y + 1) / keenness)
        };
        this.matrices = {
            base: new Int16Array(this.size.x * this.size.y).fill(0),
            boxMap: new Int16Array(this.size.x * this.size.y).fill(0)
        }
        this.offset = {
            x: this.mapData.geometry.min_x,
            y: this.mapData.geometry.min_y,
        }
        this.x_lines = [];
        this.y_lines = [];

        this.spawns = this.mapData.spawns;
    }

    setBox(x1, y1, x2, y2, size, obj, value) {
        const lowX = Math.max(x1, 0);
        const lowY = Math.max(y1, 0);
        const highX = Math.min(x2, size.x - 1);
        const highY = Math.min(y2, size.y - 1);
        for (let x = lowX; x <= highX; x++)
            for (let y = lowY; y <= highY; y++)
                obj[this.size.x * y + x] = value;
    }

    fill(x, y, value) {
        const width = this.size.x;
        const open = [(x + y * width)-1];
        let c = 0;
        while (open.length - c > 0) {
            let pos = open[c];
            if (this.matrices.base[pos] === 0) {
                this.matrices.base[pos] = value;
                (pos + 1) % width === 0 ? 0 : open.push(pos + 1);
                (pos - 1) % width === width - 1 ? 0 : open.push(pos - 1);
                open.push(pos + width);
                open.push(pos - width);
            }
            c++;
        }
    }

    detectBoxSize(x, y, boxMap) {
        if (this.matrices.base[x + y * this.size.x] !== 2) {
            return null;
        }

        let boxSize = {
            x: 0,
            y: 0
        };
        let canExpand = {
            x: true,
            y: true,
        };
        while (canExpand.x || canExpand.y) {
            if (x + boxSize.x >= this.size.x) {
                canExpand.x = false;
                canExpand.y = false;
            }
            if (y + boxSize.y >= this.size.y) {
                canExpand.y = false;
                canExpand.x = false;
            }
            if (canExpand.x) {
                for (let i = 0; i < boxSize.y; i++) {
                    let lx = x + boxSize.x;
                    let ly = (y + i);
                    //console.log("x", lx, ly, boxSize)
                    if (this.matrices.base[lx + ly * this.size.x] !== 2 || boxMap[lx + ly * this.size.x] !== 0) {
                        canExpand.x = false;
                        canExpand.y = false;

                        break;
                    }
                }
                if (canExpand.x) {
                    boxSize.x++;
                }
            }
            if (canExpand.y) {
                for (let i = 0; i < boxSize.x; i++) {
                    let lx = x + i;
                    let ly = (y + boxSize.y);
                    //console.log("y", lx, ly, boxSize)
                    if (this.matrices.base[lx + ly * this.size.x] !== 2 || boxMap[lx + ly * this.size.x] !== 0) {
                        canExpand.y = false;
                        canExpand.x = false;
                        break;
                    }
                }
                if (canExpand.y) {
                    boxSize.y++;
                }
            }
        }
        return boxSize
    }
}

module.exports = Floor;