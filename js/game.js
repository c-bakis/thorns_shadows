let canvas;
let world;

function init() {   
    canvas = document.getElementById("canvas");
    canvas.width = 720;
    canvas.height = 480;
    world = new World(canvas);

}