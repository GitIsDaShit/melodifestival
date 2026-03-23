import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "infotrek2025";

export default async (req, context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ogiltig data" }, { status: 400 });
  }

  const { password, action, songId } = body;

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: "Fel lösenord" }, { status: 401 });
  }

  const store = getStore("melodifestival");

  if (action === "reset-ips") {
    // Clear all IP blocks — everyone can upload and vote again
    await store.set("upload-ips", JSON.stringify({}));
    await store.set("vote-ips", JSON.stringify({}));
    return Response.json({ ok: true, message: "IP-spärrar rensade" });
  }

  if (action === "reset-all") {
    // Wipe everything
    await store.set("songs", JSON.stringify([]));
    await store.set("upload-ips", JSON.stringify({}));
    await store.set("vote-ips", JSON.stringify({}));
    return Response.json({ ok: true, message: "Allt rensat" });
  }

  if (action === "delete-song") {
    if (!songId) return Response.json({ error: "Saknar songId" }, { status: 400 });
    const raw = await store.get("songs");
    const songs = raw ? JSON.parse(raw) : [];
    const filtered = songs.filter(s => s.id !== songId);
    await store.set("songs", JSON.stringify(filtered));
    return Response.json({ ok: true, message: "Låt borttagen" });
  }

  return Response.json({ error: "Okänd åtgärd" }, { status: 400 });
};

export const config = { path: "/api/admin" };
