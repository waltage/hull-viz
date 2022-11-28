import { Point } from "../libraries/geom/point";
import { BaseDynamicHull, drawLine } from "./baseHull";

interface OrderStatistics {
  minX?: number;
  minY?: number;
}

class waltNode {
  point: Point;
  left: waltNode;
  inner: waltNode;
  right: waltNode;
  parent: waltNode;
  os: OrderStatistics;

  constructor(point: Point) {
    this.point = point;
    this.left = null;
    this.inner = null;
    this.right = null;
    this.parent = null;
    this.os = {};
  }

  get x(): number {
    return this.point.x;
  }

  get y() {
    return this.point.y;
  }

  addChild(node: waltNode) {
    if (node.x)
      if (this.left == null) {
        // missing left
        if (node.x < this.x) {
          node.parent = this;
          this.left = node;
          return;
        }
      }
    if (this.right == null) {
      // missing right
      if (node.x > this.x) {
        node.parent = this;
        this.right = node;
        return;
      }
    }
    if (this.inner == null) {
      let innerD = node.point.distanceTo(this.point);
      let leftD = node.point.distanceTo(this.left?.point);
      let rightD = node.point.distanceTo(this.right?.point);
      console.log(innerD, leftD, rightD);
    }
  }
}

class waltTree {
  root: waltNode;

  constructor() {
    this.root = null;
  }

  clear() {
    this.root = null;
  }

  /** Inserts a node using a Point, and returns the waltNode. */
  insert(point: Point): waltNode {
    let newNode = new waltNode(point);
    if (this.root == null) {
      this.root = newNode;
      return newNode;
    }
    if (point.y > this.root.y) {
      // need new vertical root
      let old = this.root;
      old.parent = newNode;
      if (old.y < newNode.y) {
        this.root = newNode;
        // replace root
        if (old.x < newNode.x) {
          // left
          newNode.left = old;
          return newNode;
        } else {
          // right
          newNode.right = old;
          return newNode;
        }
      }
    } else {
      this.root.addChild(newNode);
    }
  }
  draw(p: any) {
    let curr = this.root;
    let q = [this.root];
    while (q.length > 0) {
      curr = q.pop();
      if (curr == null) {
        break;
      }
      p.strokeWeight(8);
      p.point(curr.x, curr.y);
      if (curr.left) {
        drawLine(p, curr.point, curr.left.point, { color: "rgb(255, 0, 0)" });
        q.push(curr.left);
      }
      if (curr.right) {
        drawLine(p, curr.point, curr.right.point, { color: "rgb(0, 0, 255)" });
        q.push(curr.right);
      }
      if (curr.inner) {
        drawLine(p, curr.point, curr.inner.point);
        q.push(curr.inner);
      }
    }
  }
}

export class Walt extends BaseDynamicHull {
  points: Point[];
  tree: waltTree;

  constructor() {
    super();
    this.points = [];
    this.tree = new waltTree();
  }
  insert(pnt: Point) {
    this.points.push(pnt);
    let node = this.tree.insert(pnt);
  }
  draw(p: any) {
    /*
    p.stroke(0);
    p.strokeWeight(10);
    this.points.forEach((element) => {
      p.point(element.x, element.y);
    });
    */
    this.tree.draw(p);
  }
  reset() {
    this.points = [];
    this.tree.clear();
  }
}
