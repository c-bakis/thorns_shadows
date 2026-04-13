class MovableObject {
    x = 120;
    y = 300;
    height = 100;
    width = 100;
    speed = 0;
    img;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    constructor() {
    }
}