import { Preparata } from "../algos/preparata";
import { Walt } from "../algos/walt";
import { BakerStaticQuickHull } from "../algos/bakerStaticQuickHull";

const preparata = new Preparata();
const walt = new Walt();
const bakerStatickQuickHull = new BakerStaticQuickHull();

window.ALGORITHMS = {
  preparata: preparata,
  walt: walt,
  bakerStaticQuickHull: bakerStatickQuickHull,
};
