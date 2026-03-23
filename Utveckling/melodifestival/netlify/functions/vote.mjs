import { getStore } from "@netlify/blobs";

function getIP(req, context) {
  const ip = context?.ip
    || req.headers.get("x-nf-client-connection-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  console.log("Vote IP:", ip);
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
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const ip = getIP(req, context);
    const store = getStoreWithContext(context);

  const rawSongs = await store.get("songs");
    const rawSongs = await store.get("songs");
    const songs = rawSongs ? JSON.parse(rawSongs) : [];

    const rawVoteIPs = await store.get("vote-ips");
    const voteIPs = rawVoteIPs ? JSON.parse(rawVoteIPs) : {};

    if (voteIPs[ip]) {
      return Response.json({ error: "Din IP-adress har redan röstat" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Ogiltig data" }, { status: 400 });
    }

    const { songId } = body;
    const song = songs.find(s => s.id === songId);
    if (!song) {
      return Response.json({ error: "Låten hittades inte" }, { status: 404 });
    }

    song.votes += 1;
    voteIPs[ip] = songId;

    await store.set("songs", JSON.stringify(songs));
    await store.set("vote-ips", JSON.stringify(voteIPs));

    console.log("Vote registered for:", songId, "from IP:", ip);
    return Response.json({ ok: true, songId, votes: song.votes });

  } catch (err) {
    console.error("Vote error:", err?.message || err);
    return Response.json({ error: "Serverfel: " + (err?.message || "okänt fel") }, { status: 500 });
  }
};

export const config = { path: "/api/vote" };
