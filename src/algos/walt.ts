import { angleAxes, angleAxesResult } from "../libraries/geom/orientation";
import { Point } from "../libraries/geom/point";
import { BaseDynamicHull, drawLine } from "./baseHull";

type OrderStatistics = {
  minX?: number;
  minY?: number;
};

type yBandResult = {
  max: number;
  min: number;
  maxChild: waltNode;
  minChild: waltNode;
};

function fillEmptyOuter(node: waltNode, child: waltNode): boolean {
  if (node.left == null && child.x < node.x) {
    child.parent = node;
    node.left = child;
    return true;
  }
  if (node.right == null && child.x > node.x) {
    child.parent = node;
    node.right = child;
    return true;
  }
  return false;
}

function fillInner(node: waltNode, child: waltNode): boolean {
  if (node.inner != null) {
    // inner is full
    return false;
  }
  console.log(node.yBand);
  if (child.y < node.yBand.min) {
    // child is below node's child
    return false;
  }
  let tempAngle = angleAxes(node.point, child.point);
  if (child.x > node.x) {
    // might be right
    if (tempAngle.angleY > node.right.yAngleParent.angleY) {
      // this is outside right, need to swap
      return false;
    }
    child.parent = node;
    node.inner = child;
    return true;
  } else {
    // might be left
    if (tempAngle.angleY > node.left.yAngleParent.angleY) {
      // this is outside left, need to swap
      return false;
    }
    child.parent = node;
    node.inner = child;
    return true;
  }
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

  get yAngleParent(): angleAxesResult {
    if (this.parent == null) {
      return;
    }
    return angleAxes(this.parent.point, this.point);
  }

  get yBand(): yBandResult {
    let result: yBandResult = {
      max: -Infinity,
      min: Infinity,
      maxChild: this,
      minChild: this,
    };
    [this.left, this.inner, this.right].forEach((element: waltNode) => {
      if (element != null) {
        if (element.y > result.max) {
          result.max = element.y;
          result.maxChild = element;
        }
        if (element.y < result.min) {
          result.min = element.y;
          result.minChild = element;
        }
      }
    });
    return result;
  }

  addChild(node: waltNode) {
    if (fillEmptyOuter(this, node)) return;
    if (fillInner(this, node)) return;
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
      let oldRoot = this.root;
      oldRoot.parent = newNode;
      if (oldRoot.x < newNode.x) {
        // left
        newNode.left = oldRoot;
        this.root = newNode;
        return newNode;
      } else {
        // right
        newNode.right = oldRoot;
        this.root = newNode;
        return newNode;
      }
    } else {
      this.root.addChild(newNode);
      return newNode;
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
