export class Preparata2 {
  constructor() {
    this.points = [];
    this.interior = new Point(0, 0);
    this.tree = new RBTree(this.comparator.bind(this));

    this.ccBisectors = {
      prior: null,
      next: null,
    };

    this.showPolar = false;
    this.showRoot = false;
    this.showMin = false;
    this.showBisectors = false;
    this.showAlpha = false;
  }
  angleTo(pt) {
    return Math.atan2(pt.y - this.interior.y, pt.x - this.interior.x);
  }
  comparator(pt1, pt2) {
    if (pt1.isEqualTo(pt2)) {
      return 0;
    } else {
      return this.angleTo(pt1) - this.angleTo(pt2);
    }
  }
  reset() {
    this.points = [];
    this.interior = new Point(0, 0);
    this.tree.clear();
    this.ccBisectors = {
      prior: null,
      next: null,
    };
  }
  insert(x, y) {
    let newPt = new Point(x, y);
    this.points.push(newPt);
    if (this.points.length < 3) {
      this._getInteriorZero();
      return;
    }
    if (this.points.length == 3) {
      this._getInteriorZero();
      this.tree.insert(this.points[0]);
      this.tree.insert(this.points[1]);
      this.tree.insert(newPt);
      return;
    }
    // happy logic;
    this.tangents(newPt);
    this.tree.insert(newPt);
  }
  getBisectors(pt) {
    this.tree.insert(pt);
    let nodeIter = this.tree.findIter(pt);

    let myValue = nodeIter.data();
    if (myValue.isEqualTo(this.tree.min())) {
      // this is the lowest polar; take next and max
      this.ccBisectors.next = nodeIter.next();
      this.ccBisectors.prior = this.tree.max();
    } else if (myValue.isEqualTo(this.tree.max())) {
      // this is the highest polar; prev and min
      this.ccBisectors.prior = nodeIter.prev();
      this.ccBisectors.next = this.tree.min();
    } else {
      // we are in the middle of two existing points
      let prev = nodeIter.prev();
      nodeIter.next();
      let next = nodeIter.next();
      this.ccBisectors.prior = prev ? prev : this.tree.min();
      this.ccBisectors.next = next ? next : this.tree.max();
    }

    this.tree.remove(pt);
  }

  tangents(pt) {
    this.getBisectors(pt);
  }

  draw(p) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].draw(p);
    }

    this._drawPolar(p);
    this._drawRoot(p);
    this._drawMin(p);

    this._drawBisectors(p);
    this._drawAlpha(p);
  }
  togglePolar() {
    this.showPolar = !this.showPolar;
  }
  toggleRoot() {
    this.showRoot = !this.showRoot;
  }
  toggleMin() {
    this.showMin = !this.showMin;
  }
  toggleBisectors() {
    this.showBisectors = !this.showBisectors;
  }
  toggleAlpha() {
    this.showAlpha = !this.showAlpha;
  }
  _drawPolar(p) {
    if (!this.showPolar || this.points.length == 0) {
      return;
    }
    let interiorAbsolute = this.interior.asAbsolute(p);
    p.push();
    p.stroke("rgba(0, 255, 0, 0.25)");
    p.strokeWeight(24);
    this.interior.draw(p);
    p.noStroke();
    p.fill("rgba(0, 255, 0, 0.8)");
    p.textSize(8);
    p.text("interior 0", interiorAbsolute.x - 10, interiorAbsolute.y - 10);

    p.pop();

    let itm = 0;
    this.tree.each((element) => {
      itm += 1;
      p.push();
      p.translate(element.x - 10, p.height - element.y + 15);
      p.scale(1, 1);
      p.textSize(10);
      p.strokeWeight(0);
      p.fill("rgba(0, 0, 255,.25)");
      p.text("polar rnk:" + itm, 0, 0);
      p.pop();

      p.push();
      p.strokeWeight(1);
      p.stroke(120, 120, 120);
      let elementAbsolute = element.asAbsolute(p);
      p.line(
        interiorAbsolute.x,
        interiorAbsolute.y,
        elementAbsolute.x,
        elementAbsolute.y
      );
      p.pop();
    });
  }
  _drawRoot(p) {
    if (!this.showRoot || this.tree.size == 0) {
      return;
    }
    let rootAbs = this.tree._root.data.asAbsolute(p);
    p.push();
    p.strokeWeight(3);
    p.stroke("rgba(150, 0, 150, .8)");
    p.noFill();
    p.ellipse(rootAbs.x, rootAbs.y, 30, 10);

    p.noStroke();
    p.fill("rgba(150, 0, 150, 0.8)");
    p.textSize(10);
    p.text("root M", rootAbs.x - 10, rootAbs.y - 10);
    p.pop();
  }
  _drawMin(p) {
    if (!this.showMin || this.tree.size == 0) {
      return;
    }
    let minPoint = this.tree.min();
    let minPointAbs = minPoint.asAbsolute(p);

    p.push();
    p.strokeWeight(3);
    p.stroke("rgba(150, 150, 0, .8)");
    p.noFill();
    p.ellipse(minPointAbs.x, minPointAbs.y, 30, 10);
    p.pop();
  }
  _drawBisectors(p) {
    if (
      !this.showBisectors ||
      this.ccBisectors.next == null ||
      this.ccBisectors.prior == null
    ) {
      return;
    }
    p.push();
    p.stroke("rgba(200,200,200,.6)");
    p.strokeWeight(20);
    this.ccBisectors.next.draw(p);
    this.ccBisectors.prior.draw(p);
    p.pop();
  }
  _drawAlpha(p) {
    if (!this.showAlpha || this.points.length < 4) {
      return;
    }
    // alpha is m -> last point -> Root
    let littleM = this.tree.min();
    let littleMAbs = littleM.asAbsolute(p);

    let pSubI = this.points[this.points.length - 1];
    let pSubIAbs = pSubI.asAbsolute(p);

    let bigM = this.tree._root.data;
    let bigMAbs = bigM.asAbsolute(p);

    let alpha =
      Math.atan2(bigM.y - pSubI.y, bigM.x - pSubI.x) -
      Math.atan2(littleM.y - pSubI.y, littleM.x - pSubI.x);

    p.push();
    p.stroke(120, 120, 0);
    p.strokeWeight(4);
    p.line(littleMAbs.x, littleMAbs.y, pSubIAbs.x, pSubIAbs.y);
    p.line(pSubIAbs.x, pSubIAbs.y, bigMAbs.x, bigMAbs.y);
    p.noStroke();
    p.fill(120, 120, 0);
    p.text("Alpha:" + alpha.toPrecision(3), 20, p.height - 20);
    p.pop();
  }
  _getInteriorZero() {
    this.interior = new Point(0, 0);
    this.points.forEach((element) => {
      this.interior.x += element.x;
      this.interior.y += element.y;
    });
    this.interior.x /= this.points.length;
    this.interior.y /= this.points.length;
  }
}
