import { getStore } from "@netlify/blobs";

const MAX_SIZE_MB = 20;

function getIP(req, context) {
  return context?.ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const ip = getIP(req, context);
  const store = getStore("melodifestival");

  // Load existing data
  const rawSongs = await store.get("songs");
  const songs = rawSongs ? JSON.parse(rawSongs) : [];

  const rawIPs = await store.get("upload-ips");
  const uploadIPs = rawIPs ? JSON.parse(rawIPs) : {};

  // IP check
  if (uploadIPs[ip]) {
    return Response.json({ error: "Din IP-adress har redan laddat upp en låt" }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ogiltig data" }, { status: 400 });
  }

  const { uploader, title, audioData } = body;

  if (!uploader?.trim() || !title?.trim() || !audioData) {
    return Response.json({ error: "Saknad data" }, { status: 400 });
  }

  // Size check (~20 MB base64)
  if (audioData.length > MAX_SIZE_MB * 1024 * 1024 * 1.37) {
    return Response.json({ error: "Filen är för stor (max 20 MB)" }, { status: 413 });
  }

  // Name uniqueness check
  const nameTaken = songs.some(s => s.uploader.toLowerCase() === uploader.trim().toLowerCase());
  if (nameTaken) {
    return Response.json({ error: `Namnet "${uploader}" används redan` }, { status: 409 });
  }

  const newSong = {
    id: Date.now().toString(),
    uploader: uploader.trim(),
    title: title.trim(),
    audioData,
    votes: 0,
    createdAt: Date.now(),
  };

  songs.push(newSong);
  uploadIPs[ip] = Date.now();

  await store.set("songs", JSON.stringify(songs));
  await store.set("upload-ips", JSON.stringify(uploadIPs));

  // Return without audioData
  const { audioData: _, ...songMeta } = newSong;
  return Response.json({ ok: true, song: songMeta }, { status: 201 });
};

export const config = { path: "/api/upload" };
