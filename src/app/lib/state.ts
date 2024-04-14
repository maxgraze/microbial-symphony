import { AppAction, AppState, FermentData } from "./types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        displayData: action.payload,
      };
    case "TOGGLE_DRAWER":
      return { ...state, showDrawer: !state.showDrawer };
    case "SET_MOBILE":
      return { ...state, isMobile: action.payload };
    case "TOGGLE_PLAYING":
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_ACTIVE_ITEM":
      return { ...state, activeItem: action.payload };
    default:
      throw new Error("Unhandled action type");
  }
}
