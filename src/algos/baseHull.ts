import { Point } from "../libraries/geom/point";

function raise(msg: string) {
  window.alert(msg);
  throw new Error(msg);
}

enum CLICK_MODE {
  INSERT = "insert",
  DELETE = "delete",
  QUERY_INSIDE = "query-inside",
}

interface P5Position {
  active: boolean;
  destroy: boolean;
  position: any;
  targetId: string;
  mouse: { x: number; y: number };
}

interface Annotation {
  enabled: boolean;
  drawFn: Function;
}
type historyItem = { point: Point; action: string };
type clickEvent = { [index: symbol]: any } & { x: number; y: number };

/** Class representing Base DynamicHull operations for p5 animations. */
export class BaseDynamicHull {
  history: historyItem[];
  mode: CLICK_MODE;
  p5Position: P5Position;
  annotations: { [index: symbol]: Annotation };

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
  }

  /** Click handler for p5 click events. */
  click(event: clickEvent) {
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

  /** P5 sketch calls insertion prehook with coordinates. */
  insertPreHook(x: number, y: number) {
    // console.log(x, y);
    let newPoint = new Point(x, y);
    this.history.push({ point: newPoint, action: "insert" });
    this.insert(newPoint);
  }

  /** Abstract Method -- override for insertion. */
  insert(pnt: Point) {
    raise("Insert not implemented");
  }

  deletePreHook(x: number, y: number) {
    let delPoint = new Point(x, y);
    this.history.push({ point: delPoint, action: "delete" });
    this.delete(delPoint);
  }

  delete(pnt: Point) {
    raise("Delete not implemented");
  }

  queryInsidePreHook(x: number, y: number) {
    let qPoint = new Point(x, y);
    this.queryInside(qPoint);
  }

  queryInside(pnt: Point) {
    raise("Query (Inside) not implemented");
  }

  reset() {
    this.history = [];
    for (const [name, annotation] of Object.entries(this.annotations)) {
      let a = <Annotation>annotation;
      a.enabled = false;
    }
    this.resetPostHook();
  }

  resetPostHook() {
    raise("Reset not implemented");
  }

  draw(p: any) {
    raise("Draw Not Implemented");
  }

  annotate(p: any) {
    for (const [name, annotation] of Object.entries(this.annotations)) {
      let a = <Annotation>annotation;
      if (a.enabled && a.drawFn) {
        p.push();
        a.drawFn(p);
        p.pop();
      }
    }
  }

  toggleAnnotation(annotationName: symbol) {
    this.annotations[annotationName].enabled =
      !this.annotations[annotationName].enabled;
  }

  makeP5(targetId: string) {
    if (this.p5Position.active) {
      return;
    }
    this.p5Position.active = true;
    const makeSketch = (sketch: any) => {
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
    // @ts-ignore
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

type drawTextFormat = {
  color?: any;
  size?: number;
};

export function drawText(
  p: any,
  text: string,
  x: number,
  y: number,
  { color, size }: drawTextFormat = {}
) {
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

type drawLineFormat = {
  color?: any;
  weight?: number;
};

export function drawLine(
  p: any,
  pnt1: Point,
  pnt2: Point,
  { weight, color }: drawLineFormat = {}
) {
  p.push();
  weight = weight ? weight : 1;
  color = color ? color : 0;
  p.strokeWeight(weight);
  p.stroke(color);
  p.line(pnt1.x, pnt1.y, pnt2.x, pnt2.y);
  p.pop();
}

export async function sleep(millis: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
