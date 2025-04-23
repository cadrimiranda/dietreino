import { create } from "zustand";
import { TStore } from "./types";
import createActions from "./actions";
import state from "./state";

export const useGlobalStore = create<TStore>((...args) => {
  const actions = createActions(...args);

  return {
    ...state,
    ...actions,
  };
});
