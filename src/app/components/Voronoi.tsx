import React from "react";
import AudioManager from "./AudioManager";
import VoronoiVisualization from "./VoronoiVisualization";

interface VoronoiProps {
  data: any;
  circlePolygon: [number, number][];
  legend: boolean;
  isPlaying: boolean;
  wh: [string, string];
}

const Voronoi: React.FC<VoronoiProps> = ({
  data,
  circlePolygon,
  legend,
  isPlaying,
  wh,
}) => {
  return (
    <AudioManager
      onNodeInteract={(onStartClick) => {
        // Pass onStartClick to VoronoiVisualization or bind it to a mouse event
      }}
    >
      <VoronoiVisualization
        data={data}
        circlePolygon={circlePolygon}
        legend={legend}
        wh={wh}
        onMouseOver={onStartClick} // Assuming onStartClick is adapted to handle this directly
        onMouseLeave={() => {}}
      />
    </AudioManager>
  );
};

export default Voronoi;
