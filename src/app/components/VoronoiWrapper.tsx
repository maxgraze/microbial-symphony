"use client";
import React, { useRef, useEffect, useState } from "react";
import useResizeObserver from "use-resize-observer";
import Voronoi from "./Voronoi";
import styles from "../lib/styles/VoronoiWrapper.module.scss";
import * as d3 from "d3";
import VoronoiCircles from "./VoronoiCircles";
import { circularPolygon } from "../lib/utils";
import Tooltip from "./Tooltip";

const VoronoiWrapper = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState();
  //   const { ref, width } = useResizeObserver();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("data/groupedByFerment.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const spacing = 10;

  const height = 1000;
  const width = 1000;
  const columns = 12;
  const cellWidth = (width - margin.left - margin.right) / columns;
  const cellHeight = (height - margin.top - margin.bottom) / columns;

  let circlePolygon = circularPolygon(
    [cellWidth / 2, cellHeight / 2],
    Math.min(cellWidth, cellHeight) / 2,
    100
  );

  return (
    // <div style={{ position: "relative" }}>
    //   <svg ref={svgRef} width={width} height={height}>
    //     {data && <Voronoi data={data} width={width} height={height} />}
    //   </svg>
    // </div>
    <div className={styles.voronoiGrid}>
      {/* <svg ref={svgRef} width={width} height={height}> */}
      {data &&
        data.map((data, i) => (
          <div key={i} className={styles.voronoiCell}>
            {/* <Tooltip config={tooltip} /> */}
            <VoronoiCircles data={data} key={i} circlePolygon={circlePolygon} />
          </div>
        ))}
      {/* </svg> */}
    </div>
  );
};

export default VoronoiWrapper;

// return (
//     <div className="voronoi-grid" ref={ref}>
//       {data.map((data, i) => (
//         <Voronoi data={data} key={i} />
//       ))}
//     </div>
//   );
