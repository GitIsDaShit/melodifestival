import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Saknar id" }, { status: 400 });

  const store = getStore("melodifestival");
  const rawSongs = await store.get("songs");
  const songs = rawSongs ? JSON.parse(rawSongs) : [];
  const song = songs.find(s => s.id === id);

  if (!song) return Response.json({ error: "Hittades inte" }, { status: 404 });

  return Response.json({ audioData: song.audioData });
};

export const config = { path: "/api/get-audio" };
