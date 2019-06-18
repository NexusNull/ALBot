function draw_line(x1, y1, x2, y2, png, color) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
        if (x1 > x2) {
            let tmp = x2;
            x2 = x1;
            x1 = tmp;

            let tmp1 = y2;
            y2 = y1;
            y1 = tmp1;
        }
        let vecX = x2 - x1;
        let vecY = y2 - y1;
        if (!color)
            color = [0, 0, 0, 255];

        for (let x = x1, i = 0; x < x2; i++, x++) {
            let y = y1 + Math.round((vecY / vecX) * i);
            //out of bounds check
            if (x > png.width - 1 || x < 0 || y > png.height - 1 || y < 0)
                continue;
            let idx = (png.width * y + x) << 2;
            png.data[idx] = color[0];
            png.data[idx + 1] = color[1];
            png.data[idx + 2] = color[2];
            png.data[idx + 3] = color[3];
        }
    } else {
        if (y1 > y2) {
            let tmp = x2;
            x2 = x1;
            x1 = tmp;

            let tmp1 = y2;
            y2 = y1;
            y1 = tmp1;
        }
        let vecY = y2 - y1;
        let vecX = x2 - x1;
        if (!color)
            color = [0, 0, 0, 255];

        for (let y = y1, i = 0; y < y2; i++, y++) {
            let x = x1 + Math.round((vecX / vecY) * i);
            if (x > png.width - 1 || x < 0 || y > png.height - 1 || y < 0)
                continue;
            let idx = (png.width * y + x) << 2;
            png.data[idx] = color[0];
            png.data[idx + 1] = color[1];
            png.data[idx + 2] = color[2];
            png.data[idx + 3] = color[3];
        }
    }
}

function draw_dot(x, y, size, png, color) {
    x = Math.floor(x);
    y = Math.floor(y);

    for (let i = -size + 1; i < size; i++)
        for (let j = -size + 1; j < size; j++) {
            if (x + j > png.width - 1 || x + j < 0 || y + i > png.height - 1 || y + i < 0)
                continue;
            let idx = (png.width * (y + j) + x + i) << 2;
            png.data[idx] = color[0];
            png.data[idx + 1] = color[1];
            png.data[idx + 2] = color[2];
            png.data[idx + 3] = color[3];
        }
}

module.exports = {
    draw_line: draw_line,
    draw_dot: draw_dot,
}