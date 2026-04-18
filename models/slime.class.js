import MovableObject from "./movable-object.class.js";

export default class Slime extends MovableObject {
    damage = 10;

    IMAGES_WALKING = [
        "img/enemies/blue_slime/walk1.png",
        "img/enemies/blue_slime/walk2.png",
        "img/enemies/blue_slime/walk3.png",
        "img/enemies/blue_slime/walk4.png",
        "img/enemies/blue_slime/walk5.png",
        "img/enemies/blue_slime/walk6.png",
        "img/enemies/blue_slime/walk7.png",
        "img/enemies/blue_slime/walk8.png",
    ];

    currentImg = 0;
    animationCounter = 0;

    
    constructor() {
        super();
        this.loadImage("img/enemies/blue_slime/walk1.png");
        this.x = Math.random() * 350 + 350;
        this.y = 370;
        this.width = 50;
        this.height = 40;
        this.speed = 0.15 + Math.random() * 0.25; 
        this.loadImages(this.IMAGES_WALKING);

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();
            this.initiateAnimation(14, this.IMAGES_WALKING);
        }, 1000 / 60);

    }
}