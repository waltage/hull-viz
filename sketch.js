import { Preparata } from "./algos/preparata.js";

const prep79 = new Preparata();

function makeSketch(p) {
  p.setup = function () {
    let canvas = p.createCanvas(600, 600);
    canvas.mouseClicked((event) => {
      prep79.insert(p.mouseX, p.height - p.mouseY);
    });
  };
  p.draw = function () {
    p.background(255);
    p.strokeWeight(5);
    p.stroke(0, 0, 255);
    prep79.draw(p);
  };
}

window.algo = prep79;

new p5(makeSketch, "canvas");
