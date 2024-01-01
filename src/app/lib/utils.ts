import { createContext } from "react";

interface PlayerContextType {
  players: any;
  setPlayers: React.Dispatch<React.SetStateAction<any>>;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(
  undefined
);

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

export type FermentData = {
  ferment: string;
  children: {
    type: string;
    percentage: number;
    organism: string;
  }[];
}[];

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
];
