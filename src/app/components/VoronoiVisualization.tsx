import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { fills } from "../lib/styles/fills";
import { voronoiTreemap } from "d3-voronoi-treemap";

interface VoronoiVisualizationProps {
  data: any; // Define a more specific type based on your data structure
  circlePolygon: [number, number][]; // Adjust if your polygon structure is different
  legend: boolean;
  wh: [string, string];
  onMouseOver: (event: any, d: any) => void; // Specify the type of 'd' based on your data
  onMouseLeave: () => void;
}

interface VoronoiNode extends d3.HierarchyNode<any> {
  polygon: [number, number][];
}

const VoronoiVisualization: React.FC<VoronoiVisualizationProps> = ({
  data,
  circlePolygon,
  legend,
  wh,
  onMouseOver,
  onMouseLeave,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = legend ? 4 : 10;
    svg.attr("height", wh[0]).attr("width", wh[1]);

    const defs = svg.append("defs");
    Object.keys(fills).forEach((key) => {
      let id = key.replace(/\s+/g, "_");
      defs
        .append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 50)
        .attr("height", 50)
        .append("image")
        .attr("href", fills[key as keyof typeof fills])
        .attr("width", 50)
        .attr("height", 50);
    });

    const voronoiRoot = voronoiTreemap().clip(circlePolygon);
    const hierarchy = d3.hierarchy(data).sum((d) => d.percentage);
    voronoiRoot(hierarchy);

    let allNodes = hierarchy
      .descendants()
      .sort((a, b) => b.depth - a.depth)
      .map((d, i) => Object.assign({}, d, { id: i }));

    const nodes = svg
      .selectAll(".foreground-path")
      .data(allNodes as unknown as VoronoiNode[])
      .join("path")
      .attr("class", "foreground-path")
      .attr("d", (d) => "M" + d.polygon.join("L") + "Z")
      .attr("stroke", (d) => "ivory")
      .style("fill-opacity", (d) => (d.depth === 1 ? 1 : 0))
      .attr("fill", (d) => {
        if (d.data.type && d.depth > 0) {
          return d.data.type == "other"
            ? "#b9b9b9"
            : "url(#" + d.data.type.replace(/\s+/g, "_") + ")";
        } else if (d.data.type && d.data.type == "other") return "grey";
        else return "yellow";
      })
      .attr("stroke-width", (d) => 5 - d.depth * 2);

    nodes
      .on("mouseover", onMouseOver)
      .on("mouseleave", onMouseLeave)
      .transition()
      .duration(1000);
  }, [data, circlePolygon, legend, wh, onMouseOver, onMouseLeave]);

  return <svg ref={ref} />;
};

export default VoronoiVisualization;
