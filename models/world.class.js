class World {
    character = new Character();
    enemies = [];
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");

        // Draw once the character image is available.
        if (this.character.img.complete) {
            this.draw();
        } else {
            this.character.img.onload = () => this.draw();
            this.character.img.onerror = () => console.error("Character image failed to load.");
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.width, this.character.height);
    }
}