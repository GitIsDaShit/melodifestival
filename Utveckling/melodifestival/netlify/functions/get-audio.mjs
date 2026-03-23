const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Saknar id" }, { status: 400 });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${id}&select=audio_data`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await res.json();
    if (!rows?.length) return Response.json({ error: "Hittades inte" }, { status: 404 });

    return Response.json({ audioData: rows[0].audio_data });
  } catch (err) {
    console.error("get-audio error:", err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
};

export const config = { path: "/api/get-audio" };
