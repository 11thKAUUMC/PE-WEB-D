import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CardSize = "normal" | "large";
interface DisplayState {
  cardSize: CardSize;
  setCardSize: (size: CardSize) => void;
}

export const useDisplayStore = create<DisplayState>()(
  persist(
    (set) => ({ cardSize: "normal", setCardSize: (cardSize) => set({ cardSize }) }),
    {
      name: "umcine-display-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cardSize: state.cardSize }),
      merge: (persisted, current) => ({
        ...current,
        cardSize: (persisted as Partial<DisplayState> | undefined)?.cardSize === "large" ? "large" : "normal",
      }),
    },
  ),
);
