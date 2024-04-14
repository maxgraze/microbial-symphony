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
