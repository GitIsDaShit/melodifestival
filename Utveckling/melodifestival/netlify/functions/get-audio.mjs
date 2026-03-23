import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Saknar id" }, { status: 400 });

    const store = getStore({
      name: "melodifestival",
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_CONTEXT || context.token,
    });

    const rawSongs = await store.get("songs");
    const songs = rawSongs ? JSON.parse(rawSongs) : [];
    const song = songs.find(s => s.id === id);

    if (!song) return Response.json({ error: "Hittades inte" }, { status: 404 });

    return Response.json({ audioData: song.audioData });
  } catch (err) {
    console.error("get-audio error:", err?.message || err);
    return Response.json({ error: err?.message }, { status: 500 });
  }
};

export const config = { path: "/api/get-audio" };
