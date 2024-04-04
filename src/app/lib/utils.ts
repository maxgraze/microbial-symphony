import { createContext, useEffect, useRef, useState } from "react";

interface PlayerContextType {
  players: any;
  setPlayers: React.Dispatch<React.SetStateAction<any>>;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(
  undefined
);

export function onSticky(
  selector: string | HTMLElement,
  callback: (isSticky: boolean) => void
) {
  const element =
    typeof selector === "string" ? document.querySelector(selector) : selector;

  if (!element) {
    return;
  }

  const observer = new IntersectionObserver(
    ([event]) => callback(event.intersectionRatio < 1),
    { threshold: [1], rootMargin: "-1px 0px 0px 0px" }
  );
  observer.observe(element);

  return { observer, element };
}
export function useSticky() {
  const ref = useRef<HTMLDivElement>(null);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([event]) => setIsSticky(event.intersectionRatio < 1),
      { threshold: [1], rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return { ref, isSticky };
}
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

export interface IPlayable {
  play(): void;
  stop(): void;
}
