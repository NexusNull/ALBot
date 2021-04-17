function bSearch(search, arr) {
    let low = 0, high = arr.length - 1;
    while (low + 1 !== high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid][0] >= search) {
            high = mid;
        } else {
            low = mid;
        }
    }
    return high;
}

class Floor {
    constructor(name, mapData, keenness) {
        this.name = name
        this.mapData = mapData;
        this.size = {
            x: Math.ceil((this.mapData.geometry.max_x - this.mapData.geometry.min_x + 1) / keenness),
            y: Math.ceil((this.mapData.geometry.max_y - this.mapData.geometry.min_y + 1) / keenness)
        };
        this.matrices = {
            base: new Uint16Array(this.size.x * this.size.y).fill(0xffff),
        }
        this.offset = {
            x: this.mapData.geometry.min_x,
            y: this.mapData.geometry.min_y,
        }
        this.x_lines = [];
        this.y_lines = [];

        this.doors = [];

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
        const open = new Uint32Array(0x4000);
        open[0] = (x + y * width) | 0xf0000000;
        let first = 0,
            last = 0;
        while (first !== last + 1) {
            const pos = open[first] & 0x0fffffff;
            const dir = open[first] & 0xf0000000;

            if (this.matrices.base[pos] === 0xffff) {
                this.matrices.base[pos] = value;
                if (dir & 0x80000000 && (pos + 1) % width !== 0) open[(last = (last + 1) % open.length)] = (pos + 1) | 0xb0000000; // going right set direction all but left
                if (dir & 0x40000000 && (pos - 1) % width !== width - 1) open[(last = (last + 1) % open.length)] = (pos - 1) | 0x70000000; // going left set direction all but right
                if (dir & 0x20000000) open[(last = (last + 1) % open.length)] = (pos + width) | 0xe0000000; // going down set direction all but up
                if (dir & 0x10000000) open[(last = (last + 1) % open.length)] = (pos - width) | 0xd0000000; // going up set direction all but down
            }
            first = (first + 1) % open.length;
        }
    }

    detectBoxSize(x, y) {
        if (this.matrices.base[x + y * this.size.x] !== 0xfffd) {
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
                    if (this.matrices.base[lx + ly * this.size.x] !== 0xfffd) {
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
                    if (this.matrices.base[lx + ly * this.size.x] !== 0xfffd) {
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

    canMoveTo(x1, y1, x2, y2) {
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const X = Math.max(x1, x2);
        const Y = Math.max(y1, y2);

        for (let i = bSearch(x, this.x_lines); i < this.x_lines.length; i++) {
            const line = this.x_lines[i];
            if (line[0] > X)
                break;
            const y_com = ((y2 - y1) / (x2 - x1)) * (line[0] - x1);
            if (y_com + y1 < line[2] && y_com + y1 > line[1])
                return false;
        }

        for (let i = bSearch(y, this.y_lines); i < this.y_lines.length; i++) {
            const line = this.y_lines[i];
            if (line[0] > Y)
                break;
            const x_com = ((x2 - x1) / (y2 - y1)) * (line[0] - y1);
            if (x_com + x1 < line[2] && x_com + x1 > line[1])
                return false;
        }

        return true;
    };
}

module.exports = Floor;