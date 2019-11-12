class DrawingBoard {

    colors = {
        'black': [0, 0, 0, 1],
        'red': [255, 0, 0, 1],
        'blue': [0, 0, 255, 1]
    };

    constructor(context, width, height) {
        this.c = context;
        this.width = width;
        this.height = height;
        this.drawColor = 'black';
        this.drawRadius = 10;
    }

    draw(x, y) {
        let r = this.drawRadius;
        this.c.fillStyle = 'rgba(' + this.colors[this.drawColor].join(',') + ')';
        this.c.beginPath();
        this.c.arc(x, y, r, 0, Math.PI * 2);
        this.c.fill();
    }

    clear() {
        this.c.clearRect(0, 0, this.width, this.height);
    }
}