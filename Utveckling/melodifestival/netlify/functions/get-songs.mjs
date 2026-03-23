import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("melodifestival");

  const raw = await store.get("songs");
  const songs = raw ? JSON.parse(raw) : [];

  // Strip audioData from list to keep payload small — client fetches full song separately
  const light = songs.map(({ audioData, ...rest }) => rest);

  return Response.json({ songs: light });
};

export const config = { path: "/api/get-songs" };
