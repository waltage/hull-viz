import { Point } from "./point";

export enum Quad {
  LOWER_LEFT = "LL",
  LOWER_RIGHT = "LR",
  UPPER_LEFT = "UL",
  UPPER_RIGHT = "UR",
}
export type angleAxesResult = {
  dir: Quad;
  angleY: number;
  angleX: number;
};

export function angleAxes(atPoint: Point, toPoint: Point): angleAxesResult {
  let rads = Math.atan2(toPoint.y - atPoint.y, toPoint.x - atPoint.x);
  let angle = (rads * 180) / Math.PI;
  if (rads < 0 && rads > -Math.PI / 2) {
    return {
      dir: Quad.LOWER_RIGHT,
      angleY: 90 + angle,
      angleX: -angle,
    };
  } else if (rads > -Math.PI && rads < -Math.PI / 2) {
    return {
      dir: Quad.LOWER_LEFT,
      angleY: -angle - 90,
      angleX: 180 + angle,
    };
  } else if (rads > 0 && rads < Math.PI / 2) {
    return {
      dir: Quad.UPPER_RIGHT,
      angleY: 90 - angle,
      angleX: angle,
    };
  } else {
    return {
      dir: Quad.UPPER_LEFT,
      angleY: angle - 90,
      angleX: 180 - angle,
    };
  }
}

export function threePointArea(p1: Point, p2: Point, p3: Point) {
  return Math.abs(
    (p1.x * p2.y) + 
    (p2.x * p3.y) + 
    (p3.x * p1.y) - 
    (p1.y * p2.x) - 
    (p2.y * p3.x) - 
    (p3.y * p1.x)
  )
}
