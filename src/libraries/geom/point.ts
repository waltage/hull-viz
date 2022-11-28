interface Coordinate {
  x: number;
  y: number;
}

export class Point {
  x: number;
  y: number;

  /** Class representing a 2d point. */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Check if a Point is located at the same position as another. */
  isEqualTo(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }

  /** Return the euclidean distance from a Point to another. */
  distanceTo(pnt: Point): number {
    return Point.distanceBetween(this, pnt);
  }

  /** Convert the point's coordinates into p5-drawable coordinates. */
  p5Pos(p: any): Coordinate {
    return {
      x: this.x,
      y: p.height - this.y,
    };
  }

  /** Return the euclidean distance between two Points. */
  static distanceBetween(pnt1: Point, pnt2: Point): number {
    if (pnt1 == null || pnt2 == null) {
      return Infinity;
    }
    return Math.sqrt((pnt1.x - pnt2.x) ** 2 + (pnt1.y - pnt2.y) ** 2);
  }
}
