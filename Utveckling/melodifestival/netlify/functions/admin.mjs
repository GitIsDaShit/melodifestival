const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "infotrek2025";

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
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Ogiltig data" }, { status: 400 }); }

  const { password, action, songId } = body;

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: "Fel lösenord" }, { status: 401 });
  }

  try {
    if (action === "reset-ips") {
      await sb("/upload_ips?ip=neq.null", { method: "DELETE" });
      await sb("/vote_ips?ip=neq.null", { method: "DELETE" });
      return Response.json({ ok: true, message: "IP-spärrar rensade" });
    }

    if (action === "reset-all") {
      await sb("/songs?id=neq.null", { method: "DELETE" });
      await sb("/upload_ips?ip=neq.null", { method: "DELETE" });
      await sb("/vote_ips?ip=neq.null", { method: "DELETE" });
      return Response.json({ ok: true, message: "Allt rensat" });
    }

    if (action === "delete-song") {
      if (!songId) return Response.json({ error: "Saknar songId" }, { status: 400 });
      await sb(`/songs?id=eq.${songId}`, { method: "DELETE" });
      return Response.json({ ok: true, message: "Låt borttagen" });
    }

    return Response.json({ error: "Okänd åtgärd" }, { status: 400 });

  } catch (err) {
    console.error("Admin error:", err?.message);
    return Response.json({ error: "Serverfel: " + err?.message }, { status: 500 });
  }
};

export const config = { path: "/api/admin" };
