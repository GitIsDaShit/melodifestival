const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function getIP(req, context) {
  return context?.ip
    || req.headers.get("x-nf-client-connection-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

async function sb(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...(options.headers || {}),
    },
  });
}

export default async (req, context) => {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const ip = getIP(req, context);
    console.log("Vote from IP:", ip);

    // Check IP
    const ipRes = await sb(`/vote_ips?ip=eq.${encodeURIComponent(ip)}&select=ip`);
    const ipRows = await ipRes.json();
    if (ipRows?.length > 0) {
      return Response.json({ error: "Din IP-adress har redan röstat" }, { status: 403 });
    }

    let body;
    try { body = await req.json(); }
    catch { return Response.json({ error: "Ogiltig data" }, { status: 400 }); }

    const { songId } = body;
    if (!songId) return Response.json({ error: "Saknar songId" }, { status: 400 });

    // Check song exists
    const songRes = await sb(`/songs?id=eq.${songId}&select=id,votes`);
    const songs = await songRes.json();
    if (!songs?.length) {
      return Response.json({ error: "Låten hittades inte" }, { status: 404 });
    }

    const currentVotes = songs[0].votes || 0;

    // Increment votes
    const updateRes = await sb(`/songs?id=eq.${songId}`, {
      method: "PATCH",
      body: JSON.stringify({ votes: currentVotes + 1 }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("Vote update error:", err);
      return Response.json({ error: "Kunde inte registrera röst" }, { status: 500 });
    }

    // Register IP
    await sb("/vote_ips", {
      method: "POST",
      body: JSON.stringify({ ip, song_id: songId }),
    });

    console.log("Vote registered for:", songId, "from IP:", ip);
    return Response.json({ ok: true, songId, votes: currentVotes + 1 });

  } catch (err) {
    console.error("Vote error:", err?.message || err);
    return Response.json({ error: "Serverfel: " + (err?.message || "okänt") }, { status: 500 });
  }
};

export const config = { path: "/api/vote" };
