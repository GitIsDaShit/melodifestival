import { getStore } from "@netlify/blobs";

const MAX_SIZE_MB = 20;

function getIP(req, context) {
  const ip = context?.ip
    || req.headers.get("x-nf-client-connection-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  console.log("Upload IP:", ip);
  return ip;
}

function getStoreWithContext(context) {
  return getStore({
    name: "melodifestival",
    siteID: context.site?.id || process.env.SITE_ID,
    token: process.env.NETLIFY_BLOBS_CONTEXT || context.token,
  });
}

export default async (req, context) => {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const ip = getIP(req, context);
    console.log("Connecting to store...");
    const store = getStoreWithContext(context);

    console.log("Loading songs...");
    const rawSongs = await store.get("songs");
    const songs = rawSongs ? JSON.parse(rawSongs) : [];

    const rawIPs = await store.get("upload-ips");
    const uploadIPs = rawIPs ? JSON.parse(rawIPs) : {};

    if (uploadIPs[ip]) {
      return Response.json({ error: "Din IP-adress har redan laddat upp en låt" }, { status: 403 });
    }

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

    if (audioData.length > MAX_SIZE_MB * 1024 * 1024 * 1.37) {
      return Response.json({ error: "Filen är för stor (max 20 MB)" }, { status: 413 });
    }

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

    console.log("Saving songs...");
    await store.set("songs", JSON.stringify(songs));
    await store.set("upload-ips", JSON.stringify(uploadIPs));

    const { audioData: _, ...songMeta } = newSong;
    console.log("Upload complete:", songMeta.title);
    return Response.json({ ok: true, song: songMeta }, { status: 201 });

  } catch (err) {
    console.error("Upload error:", err?.message || err);
    return Response.json({ error: "Serverfel: " + (err?.message || "okänt fel") }, { status: 500 });
  }
};

export const config = { path: "/api/upload" };
