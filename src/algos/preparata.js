import { sameSidePoints } from "../libraries/geom/orientation.js";
import { Point } from "../libraries/geom/point";
import { RBTree } from "../libraries/rbtree/rbtree.js";
import { BaseDynamicHull, drawText, sleep, drawLine } from "./baseHull";

function setPointStyle(p) {
  p.strokeWeight(5);
  p.stroke(30, 30, 30);
}

function setHighlightStyle(p) {
  p.strokeWeight(10);
  p.stroke("rgba(200, 200, 0, .8)");
}

export class Preparata extends BaseDynamicHull {
  constructor() {
    super();
    this.points = [];
    this.interior = new Point(0, 0);
    this.hullTree = new RBTree(this.comparator.bind(this));
    this.bisectors = {
      prior: null,
      next: null,
    };

    this.annotations = {
      polar: { enabled: false, drawFn: this.annPolar.bind(this) },
      root: { enabled: false, drawFn: null },
      min: { enabled: false, drawFn: this.annMin.bind(this) },
      bisectors: { enabled: false, drawFn: this.annBisectors.bind(this) },
      alpha: { enabled: false, drawFn: null },
    };
  }
  resetPostHook() {
    this.points = [];
    this.interior = new Point(0, 0);
    this.hullTree.clear();
  }

  angleTo(pnt) {
    return Math.atan2(pnt.y - this.interior.y, pnt.x - this.interior.x);
  }
  comparator(pnt1, pnt2) {
    return this.angleTo(pnt1) - this.angleTo(pnt2);
  }

  getPolarBounds(pnt) {
    // Find the counter-clockwise previous and next nodes based on polar coordinate ranking
    // Runtime: O(log n)
    let mustRemove = false;
    let nodeIter = this.hullTree.findIter(pnt);
    if (nodeIter == null) {
      this.hullTree.insert(pnt);
      nodeIter = this.hullTree.findIter(pnt);
      mustRemove = true;
    }
    let result = { prior: null, next: null };

    if (pnt.isEqualTo(this.hullTree.min())) {
      // this is lowest polar... take next & max;
      result.prior = this.hullTree.max();
      result.next = nodeIter.next();
      if (mustRemove) this.hullTree.remove(pnt);
      return result;
    } else if (pnt.isEqualTo(this.hullTree.max())) {
      // this is the highest polar... take prev and min;
      result.prior = nodeIter.prev();
      result.next = this.hullTree.min();
      if (mustRemove) this.hullTree.remove(pnt);
      return result;
    } else {
      // we're in between two valid points... take prev and next;
      result.prior = nodeIter.prev();
      nodeIter.next();
      result.next = nodeIter.next();
      if (mustRemove) this.hullTree.remove(pnt);
      return result;
    }
  }

  async insert(pnt) {
    this.points.push(pnt);
    this.hullTree.insert(pnt);
    if (this.hullTree.size < 3) {
      return;
    } else if (this.hullTree.size == 3) {
      for (let i = 0; i < 3; i++) {
        this.interior.x += this.points[i].x;
        this.interior.y += this.points[i].y;
      }
      this.interior.x /= 3;
      this.interior.y /= 3;
    }
    this.bisectors = this.getPolarBounds(pnt);
    console.log(
      sameSidePoints(
        this.bisectors.prior,
        this.bisectors.next,
        pnt,
        this.interior
      )
    );
    // remaining logic...
  }

  draw(p) {
    setPointStyle(p);
    this.points.forEach((element) => {
      p.point(element.x, element.y);
    });
    if (this._hold > 0) {
      drawText(p, "HOLD", 20, 20);
    }
  }

  /* Annotations */
  annMin(p) {
    if (this.points.length == 0) {
      return;
    }

    setHighlightStyle(p);

    let last = this.points.at(-1);
    p.point(last.x, last.y);
    p.point(this.p5Position.mouse.x, this.p5Position.mouse.y);
  }
  annPolar(p) {
    let centerColor = "rgba(35, 180, 80, .5)";
    p.stroke(centerColor);
    p.strokeWeight(15);
    p.point(this.interior.x, this.interior.y);
    drawText(p, "inner 🄌", this.interior.x + 10, this.interior.y, {
      size: 10,
      color: centerColor,
    });

    let itm = 0;

    this.hullTree.each((element) => {
      itm++;
      drawLine(p, this.interior, element, { color: centerColor });
      drawText(p, "polar rank:" + itm, element.x, element.y - 10, {
        color: centerColor,
        size: 8,
      });
    });
  }
  annBisectors(p) {
    p.stroke("rgba(80, 10, 100, .2)");
    p.strokeWeight(15);
    if (this.bisectors.next != null) {
      p.point(this.bisectors.next.x, this.bisectors.next.y);
    }
    if (this.bisectors.prior != null) {
      p.point(this.bisectors.prior.x, this.bisectors.prior.y);
    }
  }
}
