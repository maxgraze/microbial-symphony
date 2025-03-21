import { FermentData } from "./types";

export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export function circularPolygon(
  center: number[],
  radius: number,
  sides: number
) {
  let angle = (Math.PI * 2) / sides;
  let points = [];
  for (let i = 0; i < sides; i++) {
    let x = center[0] + radius * Math.cos(angle * i);
    let y = center[1] + radius * Math.sin(angle * i);
    points.push([x, y]);
  }
  return points;
}

export const legendData: FermentData = [
  {
    ferment: "Yeast",
    children: [
      {
        type: "yeast",
        organism: "yeast",
        percentage: 1,
      },
    ],
  },
  {
    ferment: "Mold",
    children: [
      {
        type: "mold",
        organism: "mold",
        percentage: 1,
      },
    ],
  },
  {
    ferment: "Bacilli",
    children: [
      {
        type: "bacilli",
        organism: "bacilli",
        percentage: 1,
      },
    ],
  },
  {
    ferment: "Lactic Acid Bacteria",
    children: [
      {
        type: "lactic acid bacteria",
        organism: "lactic acid bacteria",
        percentage: 1,
      },
    ],
  },
  {
    ferment: "Acetic Acid Bacteria",
    children: [
      {
        type: "acetic acid bacteria",
        organism: "acetic acid bacteria",
        percentage: 1,
      },
    ],
  },
  {
    ferment: "Other microorganism",
    children: [
      {
        type: "other",
        organism: "other",
        percentage: 1,
      },
    ],
  },
];

export const margin = { top: 10, right: 10, bottom: 10, left: 10 };

const height = 1000;
const width = 1000;
const columns = 12;
const cellWidth = (width - margin.left - margin.right) / columns;
const cellHeight = (height - margin.top - margin.bottom) / columns;

export let circlePolygon = circularPolygon(
  [cellWidth / 2, cellHeight / 2],
  Math.min(cellWidth, cellHeight) / 2,
  100
);
const height2 = 200;
const width2 = 200;
const columns2 = 5;
const cellWidth2 = width2 / columns2;
const cellHeight2 = height2 / columns2;

export let circlePolygon2 = circularPolygon(
  [cellWidth2 / 2, cellHeight2 / 2],
  Math.min(cellWidth2, cellHeight2) / 2,
  100
);

export const soysauce = {
  children: [
    {
      type: "mold",
      percentage: 0.3333333333333333,
      organism: "S. cerevisiae",
    },
    {
      type: "bacilli",
      percentage: 0.3333333333333333,
      organism: "Acetobacter",
    },
    {
      type: "yeast",
      percentage: 0.3333333333333333,
      organism: "Zygosaccharomy",
    },
  ],
  ferment: "Soy sauce",
};

export const SPRING = {
  // type: "spring",
  stiffness: 400,
  damping: 40,
  // duration: 2,
  // staggerChildren: 0.1,
  type: "spring",
  // stiffness: 100,
  // damping: 10,
  delay: 0.1,
  duration: 2,
  delayChildren: 0.5,
};

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
      type: "spring",
      stiffness: 90, 
      damping: 30,
    },
  },
};

export const childVariants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 30,
      mass: 0.8, 
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { type: "spring", stiffness: 90, damping: 30 }, // Use spring for exit for consistency
  },
};
