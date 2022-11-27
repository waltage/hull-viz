import { Point } from "../libraries/geom/point.js";

function raise(msg) {
  window.alert(msg);
  throw new Error(msg);
}

export const CLICK_MODE = {
  INSERT: "insert",
  DELETE: "delete",
  QUERY_INSIDE: "query-inside",
};

export class BaseDynamicHull {
  constructor() {
    this.history = [];
    this.mode = CLICK_MODE.INSERT;

    this.p5Position = {
      active: false,
      destroy: false,
      position: {},
      targetId: null,
      mouse: {
        x: null,
        y: null,
      },
    };

    /* 
      Annotations are basically labels.
      These take the form {
        'name': {enabled: true, drawFn: (p)=>{}}
      }
    */
    this.annotations = {};

    Reflect.defineProperty(this, "history", { writable: false });
    Reflect.defineProperty(this, "p5Position", { writable: false });
  }

  click(event) {
    let x = event.x - this.p5Position.position.left + window.scrollX;
    let y = event.y - this.p5Position.position.top + window.scrollY;

    // invert y so we get sane coordinates with origin in lower left
    y = this.p5Position.position.height - y;

    if (this.mode == CLICK_MODE.INSERT) {
      this.insertPreHook(x, y);
    } else if (this.mode == CLICK_MODE.DELETE) {
      this.deletePreHook(x, y);
    } else if (this.mode == CLICK_MODE.QUERY_INSIDE) {
      this.queryInsidePreHook(x, y);
    }
  }

  insertPreHook(x, y) {
    // console.log(x, y);
    let newPoint = new Point(x, y);
    this.history.push({ point: newPoint, action: "insert" });
    this.insert(newPoint);
  }

  insert(pnt) {
    raise("Insert not implemented");
  }

  deletePreHook(x, y) {
    // smear coordinates to find a point to remove
    let delPoint = new Point(x, y);
    this.history.push({ point: delPoint, action: "delete" });
    this.delete();
  }

  delete(pnt) {
    raise("Delete not implemented");
  }

  queryInsidePreHook(x, y) {
    let qPoint = new Point(x, y);
    this.queryInside(qPoint);
  }

  queryInside(pnt) {
    raise("Query (Inside) not implemented");
  }

  reset() {
    this.history = [];
    for (const [name, annotation] of Object.entries(this.annotations)) {
      annotation.enabled = false;
    }
    this.resetPostHook();
  }

  resetPostHook() {
    raise("Reset not implemented");
  }

  draw(p) {
    raise("Draw Not Implemented");
  }

  annotate(p) {
    for (const [name, annotation] of Object.entries(this.annotations)) {
      if (annotation.enabled && annotation.drawFn) {
        p.push();
        annotation.drawFn(p);
        p.pop();
      }
    }
  }

  toggleAnnotation(annotationName) {
    this.annotations[annotationName].enabled =
      !this.annotations[annotationName].enabled;
  }

  makeP5(targetId) {
    if (this.p5Position.active) {
      return;
    }
    this.p5Position.active = true;
    const makeSketch = (sketch) => {
      sketch.setup = () => {
        let canvas = sketch.createCanvas(600, 600);
        canvas.mouseClicked(this.click.bind(this));
      };
      sketch.draw = () => {
        this.p5Position.mouse = {
          x: sketch.mouseX,
          y: this.p5Position.position.height - sketch.mouseY,
        };
        sketch.background(255);
        // invert for xy coord at lower left;
        sketch.translate(0, this.p5Position.position.height);
        sketch.scale(1, -1);
        if (this.p5Position.destroy) {
          // If marked for destroy, remove p5 and reset
          sketch.remove();
          this.p5Position.active = false;
          this.p5Position.destroy = false;
          this.p5Position.position = {};
          return;
        }
        sketch.push();
        this.draw(sketch);
        sketch.pop();

        sketch.push();
        this.annotate(sketch);
        sketch.pop();
      };
    };
    new p5(makeSketch, targetId);
    this.p5Position.targetId = targetId;
    this._getCanvasSizing();
    window.addEventListener("resize", this._getCanvasSizing.bind(this));
  }

  destroyP5() {
    if (this.p5Position.active) {
      this.p5Position.destroy = true;
      window.removeEventListener("resize", this._getCanvasSizing.bind(this));
    }
  }

  _getCanvasSizing() {
    // helper to recalculate positioning of canvas if window reseized
    let el = document
      .getElementById(this.p5Position.targetId)
      .querySelector("canvas");
    this.p5Position.position = el.getBoundingClientRect();
  }
}

export function drawText(p, text, x, y, { color, size } = {}) {
  p.push();
  p.noStroke();
  size = size ? size : 10;
  color = color ? color : 0;
  p.fill(color);
  p.translate(x, y);
  p.scale(1, -1);
  p.textSize(size);
  p.text(text, 0, 0);
  p.pop();
}

export function drawLine(p, pnt1, pnt2, { weight, color } = {}) {
  p.push();
  weight = weight ? weight : 1;
  color = color ? color : 0;
  p.strokeWeight(weight);
  p.stroke(color);
  p.line(pnt1.x, pnt1.y, pnt2.x, pnt2.y);
  p.pop();
}

export async function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
