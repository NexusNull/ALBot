function draw_line(x1, y1, x2, y2, png, color) {
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);

  const xs = Math.min(x2, x1);
  const xl = Math.max(x2, x1);
  const ys = Math.min(y2, y1);
  const yl = Math.max(y2, y1);
  if (!color) color = [0, 0, 0, 255];


  if (x2 - x1 > y2 - y1) {
    const slope = (yl - ys)/(xl - xs)
    for (let x = xs, i = 0; x < xl; i++, x++) {
      let y = ys + Math.round(slope * i);
      //out of bounds check
      if (x > png.width - 1 || x < 0 || y > png.height - 1 || y < 0) continue;
      let idx = (png.width * y + x) << 2;
      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = color[3];
    }
  } else {
    const slope = (xl - xs)/(yl - ys)
    for (let y = ys, i = 0; y < yl; i++, y++) {
      let x = xs + Math.round((slope) * i);
      if (x > png.width - 1 || x < 0 || y > png.height - 1 || y < 0) continue;
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