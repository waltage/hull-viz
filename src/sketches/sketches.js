import { Preparata } from "../algos/preparata";
import { Walt } from "../algos/walt";

const preparata = new Preparata();
const walt = new Walt();

window.ALGORITHMS = {
  preparata: preparata,
  walt: walt,
};
