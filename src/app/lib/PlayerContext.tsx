import { Dispatch, createContext, useReducer } from "react";

// Define the shape of the state
export interface State {
  players: any; // Define more specific types if possible
  isPlaying: boolean;
  showDrawer: boolean;
  isFixed: boolean;
  isDOMReady: boolean;
  activeItem: string | null;
  displayData: any[]; // Define more specific types if possible
  isLoading: boolean;
  data: any[]; // Define more specific types if possible
}

// Define the actions
export type PlayerAction =
  | { type: "SET_PLAYERS"; payload: any }
  | { type: "TOGGLE_PLAYING"; payload: boolean }
  | { type: "TOGGLE_DRAWER" }
  | { type: "SET_FIXED"; payload: boolean }
  | { type: "DOM_READY"; payload: boolean }
  | { type: "SET_ACTIVE_ITEM"; payload: string | null }
  | { type: "SET_DISPLAY_DATA"; payload: any[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DATA"; payload: any[] };

// Define the context type
export interface PlayerContextType {
  state: State;
  dispatch: Dispatch<PlayerAction>;
}

// Define only the state part as the initialState
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

// This should already be defined correctly, just double-checking
export const PlayerContext = createContext<PlayerContextType>({
  state: initialState, // Default initial state
  dispatch: () => undefined, // Placeholder dispatch function
});

// PlayerProvider uses the correct initialState
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState); // Correct use of initialState

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
      return { ...state, isPlaying: !state.isPlaying };
    case "TOGGLE_DRAWER":
      return { ...state, showDrawer: !state.showDrawer };
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
