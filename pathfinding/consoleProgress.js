/**
 *
 * @param name
 * @param desc
 * @param length
 * @param total
 * @constructor
 */
const ProgressBar = function (name, desc, length, total) {
    this.name = name;
    this.desc = desc;
    this.length = length;
    this.current = 0;
    this.total = total;
    this.oldProgress = 0;
    this.finished = false;
    this.initiated = false;
};

ProgressBar.prototype.init = function () {
    console.log(this.desc);
    let progressHeader = new Array(this.length).fill("-");
    console.log("0%" + progressHeader.join("") + "100%");
    process.stdout.write(' [')
};

ProgressBar.prototype.advance = function (amount) {
    if (!this.initiated) {
        this.init();
        this.initiated = true;
    }

    this.current = Math.min(this.current + amount, this.length);
    let progress = Math.floor(this.current / this.total * this.length);
    for (let i = 0; i < progress - this.oldProgress; i++) {
        process.stdout.write('#');
    }
    if (progress === this.length) {
        this.finished = true;
        process.stdout.write('] \n');
    }
    this.oldProgress = progress;
};

module.exports = ProgressBar;
