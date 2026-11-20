import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BookmarkState {
  bookmarkedIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarkedIds: [],
      toggleBookmark: (movieId) => {
        if (!Number.isSafeInteger(movieId) || movieId <= 0) return;
        set((state) => ({
          bookmarkedIds: state.bookmarkedIds.includes(movieId)
            ? state.bookmarkedIds.filter((id) => id !== movieId)
            : [...state.bookmarkedIds, movieId],
        }));
      },
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => import.meta.env.VITE_BOOKMARK_STORAGE === "session" ? sessionStorage : localStorage),
      partialize: (state) => ({ bookmarkedIds: state.bookmarkedIds }),
      merge: (persisted, current) => {
        const ids = (persisted as Partial<BookmarkState> | undefined)?.bookmarkedIds;
        return {
          ...current,
          bookmarkedIds: Array.isArray(ids)
            ? [...new Set(ids)].filter((id) => Number.isSafeInteger(id) && id > 0)
            : [],
        };
      },
    },
  ),
);
