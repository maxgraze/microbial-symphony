"use client";
import { Dispatch, createContext, useReducer } from "react";
export interface PlayerContextType {
  state: State;
  dispatch: Dispatch<PlayerAction>;
}

export const initialState: State = {
  players: {},
  isPlaying: false,
  showDrawer: true,
  isFixed: false,
  isDOMReady: false,
  activeItem: null,
  displayData: [],
  isLoading: true,
  data: [],
};

interface Player {
  id: string;
  name: string;
}

interface DisplayItem {
  id: string;
  description: string;
}

interface DataItem {
  id: string;
  value: number;
}

export interface State {
  players: Record<string, Player>;
  isPlaying: boolean;
  showDrawer: boolean;
  isFixed: boolean;
  isDOMReady: boolean;
  activeItem: string | null;
  displayData: DisplayItem[];
  isLoading: boolean;
  data: DataItem[];
}

export type PlayerAction =
  | { type: "SET_PLAYERS"; payload: Record<string, Player> }
  | { type: "TOGGLE_PLAYING"; payload: boolean }
  | { type: "OPEN_DRAWER" } 
  | { type: "CLOSE_DRAWER" } 
  | { type: "SET_FIXED"; payload: boolean }
  | { type: "DOM_READY"; payload: boolean }
  | { type: "SET_ACTIVE_ITEM"; payload: string | null }
  | { type: "SET_DISPLAY_DATA"; payload: DisplayItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DATA"; payload: DataItem[] };

export const PlayerContext = createContext<PlayerContextType>({
  state: initialState, 
  dispatch: () => undefined, 
});

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState); 

  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
};
export const reducer = (state: State, action: PlayerAction): State => {
  switch (action.type) {
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    case "TOGGLE_PLAYING":
      return { ...state, isPlaying: action.payload };

    case "OPEN_DRAWER":
      return { ...state, showDrawer: true };
    case "CLOSE_DRAWER":
      return { ...state, showDrawer: false };
    case "SET_FIXED":
      return { ...state, isFixed: action.payload };
    case "DOM_READY":
      return { ...state, isDOMReady: true };
    case "SET_ACTIVE_ITEM":
      return { ...state, activeItem: action.payload };
    case "SET_DISPLAY_DATA":
      return { ...state, displayData: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_DATA":
      return { ...state, data: action.payload };
    default:
      return state;
  }
};
