const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabase(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

export default async (req, context) => {
  try {
    const res = await supabase("/songs?select=id,uploader,title,votes,created_at,audio_url&order=votes.desc");
    const songs = await res.json();
    return Response.json({ songs: Array.isArray(songs) ? songs : [] });
  } catch (err) {
    console.error("get-songs error:", err?.message);
    return Response.json({ songs: [] }, { status: 500 });
  }
};

export const config = { path: "/api/get-songs" };
