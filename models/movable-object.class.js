export default class MovableObject {
    x = 100;
    y = 263;
    height = 150;
    width = 140;
    speed = 0.15;
    imgCache = {};
    otherDirection = false;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

loadImages(arr) {
    arr.forEach(path => {
        const img = new Image();
        img.src = path;
        this.imgCache[path] = img;
    });
}

moveRight() {
    setInterval(() => {
        this.x += this.speed;
    }, 1000 / 60);
}

moveLeft() {
    setInterval(() => {
        this.x -= this.speed;
    }, 1000 / 60);
}

    constructor() {
    }
}