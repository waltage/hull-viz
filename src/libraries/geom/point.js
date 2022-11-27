export class Point {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  isEqualTo(other) {
    return this.x == other.x && this.y == other.y;
  }

  move(x, y) {
    this.x += x;
    this.y += y;
  }
  asAbsolute(p) {
    return { x: this.x, y: p.height - this.y };
  }
  draw(p) {
    p.push();
    p.translate(0, p.height);
    p.scale(1, -1);
    p.point(this.x, this.y);
    p.pop();
  }
}
