import { esculturaWorks } from "./categories/escultura";
import { imagineriaWorks } from "./categories/imagineria";
import { relieveWorks } from "./categories/relieve";
import { relieveReligiosoWorks } from "./categories/relieve-religioso";

export const categories = [
  {
    id: "escultura",
    title: "Escultura",
    image: "/images/obras/escultura/la-paz-dormida.webp",
  },
  {
    id: "imagineria",
    title: "Imaginería",
    image: "/images/obras/imagineria/imagineria-001.webp",
  },
  {
    id: "relieve",
    title: "Relieve",
    image: "/images/obras/relieve/relieve-001.webp",
  },
  {
    id: "relieve-religioso",
    title: "Relieve Religioso",
    image: "/images/obras/relieve-religioso/relieve-religioso-001.webp",
  },
];

export const works = [
  ...esculturaWorks,
  ...imagineriaWorks,
  ...relieveWorks,
  ...relieveReligiosoWorks,
];
