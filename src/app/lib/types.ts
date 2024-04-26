export interface IPlayable {
  play(): void;
  stop(): void;
}

export type FermentDataItem = {
  ferment: string;
  children: {
    type: string;
    percentage: number;
    organism: string;
  }[];
};

export type FermentData = FermentDataItem[];

export interface PlayerContextType {
  players: any; // Consider specifying a more detailed type than 'any' if possible
  setPlayers: React.Dispatch<React.SetStateAction<any>>; // Same here for more specific typing
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface VoronoiProps {
  data: any;
  circlePolygon: any;
  legend?: boolean;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  wh: [string, string];
  key?: string;
}

export interface VoronoiNode extends d3.HierarchyNode<any> {
  polygon: [number, number][];
}
