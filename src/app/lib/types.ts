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

export interface AppState {
  isLoading: boolean;
  data: FermentData[];
  displayData: FermentData[];
  isMobile: boolean;
  isPlaying: boolean;
  showDrawer: boolean;
  isFixed: boolean;
  isDOMReady: boolean;
  activeItem: string | null;
}

export type AppAction =
  | { type: "FETCH_SUCCESS"; payload: FermentData[] }
  | { type: "SET_MOBILE"; payload: boolean }
  | { type: "TOGGLE_PLAYING"; payload: boolean } // Updated to include payload
  | { type: "SET_ACTIVE_ITEM"; payload: string | null }
  | { type: "TOGGLE_DRAWER"; payload: boolean };
