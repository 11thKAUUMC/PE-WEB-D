import { mutationOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeFavorite, getFavorite, getFavorites } from "../api/favorites";
import { useAuthStore } from "../stores/auth-store";

const listKey = (session: number) => ["favorites", session, "list"] as const;
const detailKey = (session: number, movieId: number) => ["favorites", session, "detail", movieId] as const;
const favoriteMutationOptions = mutationOptions({ mutationFn: ({ movieId, add }: { movieId: number; add: boolean }) => changeFavorite(movieId, add) });

export function useFavorites() {
  const token = useAuthStore((state) => state.accessToken);
  const session = useAuthStore((state) => state.session);
  return useQuery({ queryKey: listKey(session), queryFn: ({ signal }) => getFavorites(signal), enabled: Boolean(token), retry: false });
}

export function useMovieFavorite(movieId: number) {
  const token = useAuthStore((state) => state.accessToken);
  const session = useAuthStore((state) => state.session);
  const client = useQueryClient();
  const queryKey = detailKey(session, movieId);
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getFavorite(movieId, signal),
    enabled: Boolean(token),
    retry: false,
  });
  const mutation = useMutation({
    ...favoriteMutationOptions,
    onSuccess: async (_result, { add }) => {
      await client.cancelQueries({ queryKey });
      client.setQueryData(queryKey, add);
      await client.invalidateQueries({ queryKey: listKey(session) });
    },
  });
  return { token, query, mutation };
}
