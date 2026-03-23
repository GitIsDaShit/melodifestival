const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const MAX_SIZE_MB = 15;

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
    console.log("Upload called, content-length:", req.headers.get("content-length"));
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const ip = getIP(req, context);
    console.log("Upload from IP:", ip);

    // Check IP
    const ipRes = await sb(`/upload_ips?ip=eq.${encodeURIComponent(ip)}&select=ip`);
    const ipRows = await ipRes.json();
    if (ipRows?.length > 0) {
      return Response.json({ error: "Din IP-adress har redan laddat upp en låt" }, { status: 403 });
    }

    let body;
    try { body = await req.json(); }
    catch { return Response.json({ error: "Ogiltig data" }, { status: 400 }); }

    const { uploader, title, audioUrl } = body;
    if (!uploader?.trim() || !title?.trim() || !audioUrl) {
      return Response.json({ error: "Saknad data" }, { status: 400 });
    }

    // Check name uniqueness
    const nameRes = await sb(`/songs?uploader=ilike.${encodeURIComponent(uploader.trim())}&select=id`);
    const nameRows = await nameRes.json();
    if (nameRows?.length > 0) {
      return Response.json({ error: `Namnet "${uploader}" används redan` }, { status: 409 });
    }

    const id = Date.now().toString();

    // Insert song
    const insertRes = await sb("/songs", {
      method: "POST",
      body: JSON.stringify({
        id,
        uploader: uploader.trim(),
        title: title.trim(),
        audio_url: audioUrl,
        votes: 0,
        created_at: Date.now(),
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error("Insert error:", err);
      return Response.json({ error: "Kunde inte spara låten" }, { status: 500 });
    }

    // Register IP
    await sb("/upload_ips", {
      method: "POST",
      body: JSON.stringify({ ip, created_at: Date.now() }),
    });

    console.log("Upload complete:", title, "from", uploader);
    return Response.json({ ok: true, song: { id, uploader: uploader.trim(), title: title.trim(), votes: 0, created_at: Date.now() } }, { status: 201 });

  } catch (err) {
    console.error("Upload error:", err?.message || err);
    return Response.json({ error: "Serverfel: " + (err?.message || "okänt") }, { status: 500 });
  }
};

export const config = { path: "/api/upload" };
