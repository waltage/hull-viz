import { Point } from "../libraries/geom/point";
import {threePointArea} from "../libraries/geom/orientation"
import { BaseDynamicHull, drawLine, sleep, Annotation, drawText } from "./baseHull";

function minXAccum(a: PEPoint, b: PEPoint) {
    return a.x < b.x ? a : b;
}

function maxXAccum(a: PEPoint, b: PEPoint) {
    return a.x > b.x ? a : b;
}

function reduceMaxArea(w: PEPoint, e: PEPoint) {
    return (a: PEPoint, b: PEPoint): PEPoint => {
        let area1 = threePointArea(w, a, e);
        let area2 = threePointArea(w, b, e);
        return area1 > area2 ? a : b;
    }
}

function aboveFilter(w: PEPoint, e: PEPoint, above: boolean = true) {
    let slope = (e.y - w.y) / (e.x - w.x);
    let intercept = e.y - slope * e.x;
    return (a: PEPoint): boolean => {
        let exp = intercept + slope * a.x;
        if (above) return a.y > exp;
        return a.y < exp;
    }
}

type Instruction = {
    cb: (p:any) => void;
    label: string;
    pause: number;
}

class PEPoint extends Point {
    next: PEPoint;
    constructor(x: number, y: number) {
        super(x, y);
        this.next = null;
    }
}

class BakerQuickHull {
    points: PEPoint[];
    w: PEPoint;
    steps: Instruction[];


    constructor(points: Point[]) {
        this.points = [];
        points.forEach((element)=>{
            this.points.push(new PEPoint(element.x, element.y));
        })

        this.steps = [];
        this.w = null;
        this.driver();
    }

    driver() {
        let w = this.points.reduce(minXAccum, this.points[0]);
        this.w = w;
        let e = this.points.reduce(maxXAccum, this.points[0]);
        w.next = e;
        e.next = w;

        // do above
        let maxiter = 0;
        let q = [[w, e]];
        while(q.length > 0) {
            maxiter++;
            if (maxiter > 20) {
                break;
            }
            let curr = q.shift();
            let pAbove = this.points.filter(aboveFilter(curr[0], curr[1], true));
            if (pAbove.length > 0) {
                let r = this.points.reduce(reduceMaxArea(curr[0], curr[1]));
                r.next = curr[0];
                curr[1].next = r;
                q.push([curr[0], r]);
                q.push([r, curr[1]]);
            }
        }

        console.log(this.points);


    }
}



export class BakerStaticQuickHull extends BaseDynamicHull {
    points: Point[];
    qh: PEPoint[];
    qhStart: PEPoint;

    constructor() {
        super();
        this.points = [];   
        this.qh = [];     
        this.qhStart = null;
    }


    runQh() {
        let solution = new BakerQuickHull(this.points);
        this.qhStart = solution.w;

    }
    insert(p: Point) {
        this.points.push(p);
    }

    draw(p5: any) {
        p5.stroke("rgba(0, 0, 0, 1)")
        p5.strokeWeight(8);
        this.points.forEach((pnt)=>{
            p5.point(pnt.x, pnt.y);
        });
        if (this.qhStart != null) {
            let curr = this.qhStart;
            while (curr.next != null) {
                drawLine(p5, curr, curr.next);
                curr = curr.next;
            }
        }
    }

    resetPostHook() {
        this.points = [];
    }
}