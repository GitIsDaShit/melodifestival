import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore({
      name: "melodifestival",
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_CONTEXT || context.token,
    });

    const raw = await store.get("songs");
    const songs = raw ? JSON.parse(raw) : [];
    const light = songs.map(({ audioData, ...rest }) => rest);

    return Response.json({ songs: light });
  } catch (err) {
    console.error("get-songs error:", err?.message || err);
    return Response.json({ songs: [], error: err?.message }, { status: 500 });
  }
};

export const config = { path: "/api/get-songs" };
