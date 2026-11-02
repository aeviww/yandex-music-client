import { api } from "@/api/client";
import type { Trailer } from "@/api/types";

export type TrailerKind = "track" | "album" | "artist" | "playlist";

export async function fetchTrailer(
  kind: TrailerKind,
  id: string,
  uid: number | null = null,
): Promise<Trailer | null> {
  try {
    const trailer = await api.trailer(kind, id, uid);
    return trailer.tracks.length ? trailer : null;
  } catch {
    return null;
  }
}
