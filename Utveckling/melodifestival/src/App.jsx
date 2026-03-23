import { useState, useEffect, useRef, useCallback } from "react";

const styleTag = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #ffffff;
    min-height: 100vh;
    font-family: 'Open Sans', sans-serif;
    color: #333333;
  }

  .navbar {
    background: #2b2b2b;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .navbar-logo { font-size: 15px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #ffffff; }
  .navbar-links { display: flex; gap: 32px; list-style: none; }
  .navbar-links a { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #aaaaaa; text-decoration: none; transition: color 0.2s; }
  .navbar-links a:hover { color: #ffffff; }
  @media (max-width: 600px) { .navbar { padding: 0 20px; } .navbar-links { display: none; } }

  .hero { background: #2b2b2b; padding: 0; text-align: center; position: relative; overflow: hidden; }
  .hero-illustration { width: 100%; display: block; max-height: 300px; }
  .hero-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 24px; pointer-events: none; }
  .hero-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #6ab0e0; margin-bottom: 10px; }
  .hero h1 { font-size: clamp(1.7rem, 4vw, 2.8rem); font-weight: 300; color: #ffffff; line-height: 1.3; text-shadow: 0 2px 20px #00000099; }
  .hero h1 strong { font-weight: 700; }
  .hero-sub { margin-top: 12px; font-size: 11px; color: #aaaaaa; letter-spacing: 0.12em; text-transform: uppercase; }

  .main { max-width: 900px; margin: 0 auto; padding: 56px 48px 80px; }
  @media (max-width: 600px) { .main { padding: 36px 20px 60px; } }

  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #3a6e9e; margin-bottom: 8px; }
  .section-title { font-size: 1.25rem; font-weight: 700; color: #2b2b2b; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 2px solid #eeeeee; }

  .upload-card { background: #f7f9fc; border: 1px solid #e2e8f0; border-left: 4px solid #3a6e9e; padding: 32px 36px; margin-bottom: 56px; }
  .field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  @media (max-width: 540px) { .field-group { grid-template-columns: 1fr; } }

  .field-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #666666; margin-bottom: 6px; }

  input[type="text"] {
    width: 100%; background: #ffffff; border: 1px solid #d0d8e4; border-radius: 0;
    padding: 10px 14px; font-family: 'Open Sans', sans-serif; font-size: 14px; color: #2b2b2b; outline: none; transition: border-color 0.2s;
  }
  input[type="text"]::placeholder { color: #b0b8c4; }
  input[type="text"]:focus { border-color: #3a6e9e; }

  .file-label { display: flex; align-items: center; gap: 10px; background: #ffffff; border: 1px dashed #c0ccd8; padding: 11px 14px; cursor: pointer; font-size: 13px; color: #8898a8; transition: border-color 0.2s, color 0.2s; margin-bottom: 16px; width: 100%; }
  .file-label:hover { border-color: #3a6e9e; color: #3a6e9e; }
  .file-label.has-file { border-color: #3a6e9e; color: #3a6e9e; }
  input[type="file"] { display: none; }

  .btn-primary { background: #3a6e9e; color: #ffffff; border: none; padding: 12px 32px; font-family: 'Open Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .btn-primary:hover { background: #2d5a88; }
  .btn-primary:disabled { background: #b0b8c4; cursor: not-allowed; }

  .already-done { display: flex; align-items: center; gap: 16px; padding: 4px 0; }
  .already-done-icon { width: 36px; height: 36px; background: #3a6e9e; color: #ffffff; font-size: 16px; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .already-done-text { font-size: 14px; color: #444444; }

  .list-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
  .list-meta { font-size: 11px; color: #999999; letter-spacing: 0.05em; text-transform: uppercase; }
  .sort-btns { display: flex; }
  .sort-btn { background: none; border: 1px solid #d0d8e4; padding: 6px 16px; font-size: 10px; font-family: 'Open Sans', sans-serif; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #999; cursor: pointer; transition: all 0.15s; margin-left: -1px; position: relative; }
  .sort-btn.active { background: #3a6e9e; border-color: #3a6e9e; color: #fff; z-index: 1; }
  .sort-btn:hover:not(.active) { border-color: #3a6e9e; color: #3a6e9e; }

  .songs-grid { display: grid; gap: 10px; }
  .song-card { background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid transparent; padding: 20px 24px; display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 20px; transition: box-shadow 0.15s, border-color 0.15s; position: relative; }
  .song-card:hover { box-shadow: 0 2px 12px #0000000d; border-color: #d0d8e4; }
  .song-card.voted { border-left-color: #3a6e9e; }
  .song-card.winner { border-left-color: #2b5a80; background: #f5f8fb; }

  .rank { font-size: 1.5rem; font-weight: 700; color: #dddddd; text-align: center; line-height: 1; }
  .rank.top { color: #3a6e9e; }
  .song-info { min-width: 0; }
  .song-title { font-size: 15px; font-weight: 700; color: #2b2b2b; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .song-meta { font-size: 11px; color: #999999; letter-spacing: 0.04em; text-transform: uppercase; }
  .progress-bar-bg { height: 3px; background: #eeeeee; margin-top: 10px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: #3a6e9e; transition: width 0.5s ease; }
  audio { width: 100%; height: 28px; margin-top: 10px; display: block; }

  .song-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 90px; }
  .vote-count { font-size: 2rem; font-weight: 700; color: #3a6e9e; line-height: 1; }
  .vote-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #bbbbbb; }

  .btn-vote { background: transparent; border: 1px solid #d0d8e4; padding: 7px 18px; font-family: 'Open Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #999; cursor: pointer; transition: all 0.15s; }
  .btn-vote:hover { border-color: #3a6e9e; color: #3a6e9e; background: #f0f5fa; }
  .btn-vote.active { background: #3a6e9e; border-color: #3a6e9e; color: #fff; }
  .btn-vote:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-vote.active:disabled { opacity: 1; }

  .voted-chip { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #3a6e9e; border: 1px solid #3a6e9e44; padding: 3px 10px; background: #f0f5fa; }

  .delete-btn { background: none; border: none; cursor: pointer; color: #cccccc; font-size: 12px; padding: 4px; line-height: 1; transition: color 0.2s; position: absolute; top: 10px; right: 12px; }
  .delete-btn:hover { color: #cc4444; }

  .empty-state { text-align: center; padding: 60px 20px; color: #cccccc; border: 1px dashed #e2e8f0; }
  .empty-state .icon { font-size: 2.5rem; margin-bottom: 14px; }
  .empty-state p { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }

  .loading-state { text-align: center; padding: 60px 20px; color: #aaaaaa; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
  .spinner { width: 24px; height: 24px; border: 2px solid #eeeeee; border-top-color: #3a6e9e; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-banner { background: #fff5f5; border: 1px solid #fcc; border-left: 4px solid #cc4444; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #cc4444; }

  .toast { position: fixed; bottom: 32px; right: 32px; background: #2b2b2b; border-left: 4px solid #3a6e9e; padding: 14px 20px; font-size: 12px; font-weight: 600; color: #ffffff; letter-spacing: 0.04em; z-index: 200; animation: slideIn 0.25s ease; }
  @keyframes slideIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .footer { background: #2b2b2b; padding: 28px 48px; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #555555; position: relative; }

  .admin-toggle { background: none; border: none; color: #444444; font-size: 14px; cursor: pointer; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); padding: 4px 8px; transition: color 0.2s; }
  .admin-toggle:hover { color: #888888; }

  .admin-panel { background: #1e1e1e; border-top: 1px solid #333; padding: 32px 48px; }
  .admin-panel-inner { max-width: 900px; margin: 0 auto; }
  .admin-title { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #3a6e9e; margin-bottom: 16px; }
  .admin-subtitle { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #555; margin: 20px 0 10px; }
  .admin-panel input[type="text"], .admin-panel input[type="password"] { background: #2b2b2b; border-color: #444; color: #fff; display: block; }
  .admin-panel input::placeholder { color: #555; }

  .admin-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }

  .btn-admin { background: #3a3a3a; color: #cccccc; border: 1px solid #555; padding: 8px 18px; font-family: 'Open Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
  .btn-admin:hover { background: #4a4a4a; color: #fff; }
  .btn-admin:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-admin.btn-danger { border-color: #8a3333; color: #cc6666; }
  .btn-admin.btn-danger:hover { background: #5a2020; color: #ff9999; }
  .btn-admin.btn-sm { padding: 5px 12px; font-size: 9px; }

  .admin-song-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #2b2b2b; border: 1px solid #333; margin-bottom: 6px; font-size: 13px; color: #aaaaaa; gap: 12px; }
`;

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);
  return <div className="toast">{msg}</div>;
}

export default function App() {
  const [songs, setSongs] = useState([]);
  const [audioCache, setAudioCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [voting, setVoting] = useState(null);
  const [blocked, setBlocked] = useState(() => ({
    upload: !!localStorage.getItem("mello_uploaded"),
    vote: !!localStorage.getItem("mello_voted"),
  }));
  const [myVotedId, setMyVotedId] = useState(() => localStorage.getItem("mello_voted") || null);

  const [name, setName] = useState("");
  const [songName, setSongName] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState("votes");
  const fileRef = useRef();

  // Load songs from API
  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/get-songs");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch {
      setToast("Kunde inte ladda låtar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  // Fetch audio for a specific song (lazy)
  const fetchAudio = async (id) => {
    if (audioCache[id]) return;
    try {
      const res = await fetch(`/api/get-audio?id=${id}`);
      const data = await res.json();
      setAudioCache(prev => ({ ...prev, [id]: data.audioData }));
    } catch {
      setToast("Kunde inte ladda ljudfil");
    }
  };

  const totalVotes = songs.reduce((a, s) => a + s.votes, 0);
  const maxVotes = Math.max(...songs.map(s => s.votes), 1);
  const sorted = [...songs].sort((a, b) =>
    sortBy === "votes" ? b.votes - a.votes : b.createdAt - a.createdAt
  );

  const SUPABASE_URL = "https://uzfsuuoljuwxkototldp.supabase.co";
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

  const handleUpload = async () => {
    if (!name.trim() || !songName.trim() || !audioFile) {
      setToast("Fyll i alla fält och välj en ljudfil");
      return;
    }
    setUploading(true);
    try {
      // 1. Upload file directly to Supabase Storage
      const fileExt = audioFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const storageRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/songs/${fileName}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": audioFile.type || "audio/mpeg",
          },
          body: audioFile,
        }
      );

      if (!storageRes.ok) {
        const err = await storageRes.text();
        console.error("Storage error:", err);
        setToast("Kunde inte ladda upp filen");
        return;
      }

      const audioUrl = `${SUPABASE_URL}/storage/v1/object/public/songs/${fileName}`;

      // 2. Save metadata via Netlify Function (small payload now)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploader: name.trim(),
          title: songName.trim(),
          audioUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) setBlocked(b => ({ ...b, upload: true }));
        setToast(data.error || "Uppladdning misslyckades");
      } else {
        setName(""); setSongName(""); setAudioFile(null);
        if (fileRef.current) fileRef.current.value = "";
        setBlocked(b => ({ ...b, upload: true }));
        localStorage.setItem("mello_uploaded", "1");
        setToast("Låten laddades upp!");
        await fetchSongs();
      }
    } catch (err) {
      console.error(err);
      setToast("Nätverksfel — försök igen");
    } finally {
      setUploading(false);
    }
  };

  const handleVote = async (songId) => {
    if (voting) return;
    setVoting(songId);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) setBlocked(b => ({ ...b, vote: true }));
        setToast(data.error || "Röstning misslyckades");
      } else {
        setMyVotedId(songId);
        setBlocked(b => ({ ...b, vote: true }));
        localStorage.setItem("mello_voted", songId);
        setToast("Din röst är registrerad!");
        await fetchSongs();
      }
    } catch {
      setToast("Nätverksfel — försök igen");
    } finally {
      setVoting(null);
    }
  };

  const handleDelete = async (id) => {
    setSongs(s => s.filter(x => x.id !== id));
  };

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  const adminAction = async (action, songId) => {
    if (!adminPw) { setToast("Ange lösenord"); return; }
    setAdminBusy(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPw, action, songId }),
      });
      const data = await res.json();
      if (!res.ok) { setToast(data.error || "Fel"); }
      else {
        setToast(data.message);
        if (action === "reset-all") { setSongs([]); localStorage.removeItem("mello_uploaded"); localStorage.removeItem("mello_voted"); }
        if (action === "reset-ips") { setBlocked({ upload: false, vote: false }); localStorage.removeItem("mello_uploaded"); localStorage.removeItem("mello_voted"); setMyVotedId(null); }
        if (action === "delete-song") setSongs(s => s.filter(x => x.id !== songId));
        await fetchSongs();
      }
    } catch { setToast("Nätverksfel"); }
    finally { setAdminBusy(false); }
  };

  return (
    <>
      <style>{styleTag}</style>

      <nav className="navbar">
        <span className="navbar-logo">Infotrek</span>
        <ul className="navbar-links">
          <li><a href="#">Tjänster</a></li>
          <li><a href="#">Kunder</a></li>
          <li><a href="#">Om Infotrek</a></li>
          <li><a href="#">Kontakt</a></li>
        </ul>
      </nav>

      <div className="hero">
        <svg className="hero-illustration" viewBox="0 0 1200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <rect width="1200" height="300" fill="#2b2b2b"/>
          <polygon points="100,0 160,0 300,300 40,300" fill="#3a6e9e" opacity="0.08"/>
          <polygon points="320,0 370,0 480,300 270,300" fill="#c0a050" opacity="0.07"/>
          <polygon points="560,0 610,0 680,300 490,300" fill="#3a6e9e" opacity="0.06"/>
          <polygon points="820,0 870,0 980,300 760,300" fill="#c0a050" opacity="0.07"/>
          <polygon points="1050,0 1100,0 1160,300 990,300" fill="#3a6e9e" opacity="0.08"/>
          <rect x="0" y="268" width="1200" height="2" fill="#ffffff" opacity="0.06"/>
          <line x1="118" y1="210" x2="118" y2="248" stroke="#aaaaaa" strokeWidth="2"/>
          <line x1="100" y1="248" x2="136" y2="248" stroke="#aaaaaa" strokeWidth="2.5"/>
          <polygon points="88,140 148,140 118,210" fill="none" stroke="#aaaaaa" strokeWidth="2"/>
          <polygon points="93,148 143,148 118,204" fill="#3a6e9e" opacity="0.55"/>
          <line x1="118" y1="140" x2="145" y2="118" stroke="#aaaaaa" strokeWidth="1.5"/>
          <circle cx="145" cy="116" r="6" fill="#4a8a3a"/>
          <line x1="100" y1="140" x2="100" y2="120" stroke="#cc8833" strokeWidth="1.5"/>
          <path d="M78,120 Q100,108 122,120" fill="#cc8833" opacity="0.8"/>
          <path d="M82,120 Q100,112 118,120" fill="#e8a844" opacity="0.6"/>
          <rect x="218" y="120" width="28" height="44" rx="14" fill="#555555" stroke="#888888" strokeWidth="1.5"/>
          <rect x="222" y="124" width="20" height="36" rx="10" fill="#333333"/>
          <line x1="220" y1="134" x2="246" y2="134" stroke="#666666" strokeWidth="1"/>
          <line x1="220" y1="140" x2="246" y2="140" stroke="#666666" strokeWidth="1"/>
          <line x1="220" y1="146" x2="246" y2="146" stroke="#666666" strokeWidth="1"/>
          <line x1="220" y1="152" x2="246" y2="152" stroke="#666666" strokeWidth="1"/>
          <line x1="232" y1="164" x2="232" y2="210" stroke="#888888" strokeWidth="2.5"/>
          <line x1="200" y1="210" x2="264" y2="210" stroke="#888888" strokeWidth="2.5"/>
          <path d="M258,130 Q270,142 258,154" fill="none" stroke="#3a6e9e" strokeWidth="2" opacity="0.8"/>
          <path d="M264,124 Q282,142 264,160" fill="none" stroke="#3a6e9e" strokeWidth="1.5" opacity="0.5"/>
          <path d="M270,118 Q294,142 270,166" fill="none" stroke="#3a6e9e" strokeWidth="1" opacity="0.3"/>
          <ellipse cx="370" cy="182" rx="10" ry="7" fill="#c0a050" transform="rotate(-20,370,182)"/>
          <line x1="379" y1="178" x2="379" y2="140" stroke="#c0a050" strokeWidth="2.5"/>
          <ellipse cx="420" cy="192" rx="10" ry="7" fill="#c0a050" opacity="0.7" transform="rotate(-20,420,192)"/>
          <line x1="429" y1="188" x2="429" y2="150" stroke="#c0a050" strokeWidth="2.5" opacity="0.7"/>
          <ellipse cx="460" cy="178" rx="10" ry="7" fill="#c0a050" opacity="0.7" transform="rotate(-20,460,178)"/>
          <line x1="469" y1="174" x2="469" y2="136" stroke="#c0a050" strokeWidth="2.5" opacity="0.7"/>
          <line x1="429" y1="150" x2="469" y2="136" stroke="#c0a050" strokeWidth="3" opacity="0.7"/>
          <polygon points="600,70 612,102 646,102 620,122 630,154 600,134 570,154 580,122 554,102 588,102" fill="#c0a050" opacity="0.85"/>
          <polygon points="600,80 609,104 634,104 614,118 622,142 600,128 578,142 586,118 566,104 591,104" fill="#e8c860" opacity="0.6"/>
          <path d="M700,140 L700,220 M688,220 L712,220" stroke="#bbbbbb" strokeWidth="2" fill="none"/>
          <path d="M692,140 Q700,200 708,140 Z" fill="#3a6e9e" opacity="0.4"/>
          <path d="M692,140 Q700,200 708,140 Z" fill="none" stroke="#bbbbbb" strokeWidth="1.5"/>
          <circle cx="700" cy="195" r="2" fill="#ffffff" opacity="0.4"/>
          <circle cx="703" cy="180" r="1.5" fill="#ffffff" opacity="0.35"/>
          <circle cx="698" cy="168" r="1.5" fill="#ffffff" opacity="0.3"/>
          <ellipse cx="820" cy="110" rx="28" ry="34" fill="#3a6e9e" opacity="0.7"/>
          <path d="M820,144 L818,155 L822,155 L820,144" fill="#3a6e9e" opacity="0.7"/>
          <line x1="820" y1="155" x2="825" y2="200" stroke="#3a6e9e" strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="870" cy="90" rx="26" ry="32" fill="#c0a050" opacity="0.65"/>
          <path d="M870,122 L868,133 L872,133 L870,122" fill="#c0a050" opacity="0.65"/>
          <line x1="870" y1="133" x2="878" y2="200" stroke="#c0a050" strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="850" cy="145" rx="22" ry="27" fill="#b04050" opacity="0.55"/>
          <path d="M850,172 L848,181 L852,181 L850,172" fill="#b04050" opacity="0.55"/>
          <rect x="150" y="60" width="6" height="10" rx="1" fill="#c0a050" opacity="0.5" transform="rotate(30,153,65)"/>
          <rect x="300" y="40" width="5" height="9" rx="1" fill="#3a6e9e" opacity="0.5" transform="rotate(-20,302,44)"/>
          <rect x="500" y="50" width="6" height="10" rx="1" fill="#b04050" opacity="0.4" transform="rotate(45,503,55)"/>
          <rect x="650" y="35" width="5" height="8" rx="1" fill="#c0a050" opacity="0.4" transform="rotate(-35,652,39)"/>
          <rect x="940" y="55" width="6" height="9" rx="1" fill="#3a6e9e" opacity="0.5" transform="rotate(20,943,59)"/>
          <rect x="1050" y="40" width="5" height="10" rx="1" fill="#b04050" opacity="0.45" transform="rotate(-25,1052,45)"/>
          <circle cx="180" cy="80" r="4" fill="#b04050" opacity="0.4"/>
          <circle cx="450" cy="55" r="3" fill="#c0a050" opacity="0.4"/>
          <circle cx="760" cy="70" r="4" fill="#3a6e9e" opacity="0.4"/>
          <rect x="1020" y="180" width="120" height="70" rx="4" fill="#222222" stroke="#444444" strokeWidth="1.5"/>
          <circle cx="1058" cy="210" r="20" fill="#333333" stroke="#555555" strokeWidth="1"/>
          <circle cx="1058" cy="210" r="4" fill="#3a6e9e" opacity="0.7"/>
          <circle cx="1102" cy="210" r="20" fill="#333333" stroke="#555555" strokeWidth="1"/>
          <circle cx="1102" cy="210" r="4" fill="#3a6e9e" opacity="0.7"/>
        </svg>
        <div className="hero-text">
          <div className="hero-eyebrow">Infotrek presenterar</div>
          <h1>AI-<strong>melodifestival</strong></h1>
          <p className="hero-sub">Ladda upp · Lyssna · Rösta</p>
        </div>
      </div>

      <div className="main">

        {/* ── UPLOAD ── */}
        <div className="section-label">Delta</div>
        <div className="section-title">Skicka in din låt</div>
        <div className="upload-card">
          {blocked.upload ? (
            <div className="already-done">
              <div className="already-done-icon">✓</div>
              <div className="already-done-text">Din låt är inlämnad! Scrolla ner och rösta på din favorit.</div>
            </div>
          ) : (
            <>
              <div className="field-group">
                <div>
                  <label className="field-label">Ditt namn</label>
                  <input type="text" placeholder="Förnamn Efternamn" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Låtens titel</label>
                  <input type="text" placeholder="Min AI-låt" value={songName} onChange={e => setSongName(e.target.value)} />
                </div>
              </div>
              <label className={`file-label ${audioFile ? "has-file" : ""}`}>
                <span>{audioFile ? `▶  ${audioFile.name}` : "⊕  Välj ljudfil (MP3, WAV, M4A…)"}</span>
                <input ref={fileRef} type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0] || null)} />
              </label>
              <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Laddar upp…" : "Ladda upp låt"}
              </button>
            </>
          )}
        </div>

        {/* ── SONG LIST ── */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            Laddar bidrag…
          </div>
        ) : songs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">♪</div>
            <p>Inga bidrag ännu — ladda upp det första!</p>
          </div>
        ) : (
          <>
            <div className="section-label">Omröstning</div>
            <div className="section-title">Bidrag</div>

            <div className="list-controls">
              <span className="list-meta">{songs.length} bidrag · {totalVotes} röster totalt</span>
              <div className="sort-btns">
                <button className={`sort-btn ${sortBy === "votes" ? "active" : ""}`} onClick={() => setSortBy("votes")}>Röster</button>
                <button className={`sort-btn ${sortBy === "new" ? "active" : ""}`} onClick={() => setSortBy("new")}>Nyast</button>
              </div>
            </div>

            {blocked.vote && !myVotedId && (
              <div className="error-banner">Din IP-adress har redan röstat i denna omröstning.</div>
            )}

            <div className="songs-grid">
              {sorted.map((song, idx) => {
                const isVoted = myVotedId === song.id;
                const isTop = idx === 0 && sortBy === "votes" && song.votes > 0;
                const pct = totalVotes > 0 ? Math.round((song.votes / totalVotes) * 100) : 0;
                const barWidth = maxVotes > 0 ? (song.votes / maxVotes) * 100 : 0;

                return (
                  <div key={song.id} className={`song-card ${isVoted ? "voted" : ""} ${isTop ? "winner" : ""}`}>
                    <button className="delete-btn" onClick={() => handleDelete(song.id)} title="Ta bort">✕</button>
                    <div className={`rank ${isTop ? "top" : ""}`}>{idx + 1}</div>
                    <div className="song-info">
                      <div className="song-title">{song.title}</div>
                      <div className="song-meta">{song.uploader} · {pct}% av rösterna</div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${barWidth}%` }} />
                      </div>
                      {song.audio_url
                        ? <audio controls src={song.audio_url} preload="none" />
                        : null
                      }
                    </div>
                    <div className="song-right">
                      <div>
                        <div className="vote-count">{song.votes}</div>
                        <div className="vote-label">röster</div>
                      </div>
                      {isVoted
                        ? <span className="voted-chip">Din röst</span>
                        : <button
                            className={`btn-vote ${voting === song.id ? "active" : ""}`}
                            onClick={() => handleVote(song.id)}
                            disabled={!!myVotedId || blocked.vote || !!voting}
                          >{voting === song.id ? "…" : "Rösta"}</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="footer">
        © Infotrek AB · AI-melodifestival
        <button className="admin-toggle" onClick={() => setAdminOpen(o => !o)}>⚙</button>
      </footer>

      {adminOpen && (
        <div className="admin-panel">
          <div className="admin-panel-inner">
            <div className="admin-title">Admin</div>
            <label className="field-label" style={{ marginBottom: 6 }}>Lösenord</label>
            <input
              type="password"
              placeholder="••••••••"
              value={adminPw}
              onChange={e => setAdminPw(e.target.value)}
              style={{ marginBottom: 16, maxWidth: 240 }}
            />
            <div className="admin-actions">
              <button className="btn-admin" disabled={adminBusy} onClick={() => adminAction("reset-ips")}>
                Rensa IP-spärrar
              </button>
              <button className="btn-admin btn-danger" disabled={adminBusy} onClick={() => {
                if (confirm("Är du säker? Detta raderar ALLA låtar och röster.")) adminAction("reset-all");
              }}>
                Rensa allt
              </button>
            </div>
            {songs.length > 0 && (
              <>
                <div className="admin-subtitle">Ta bort enskild låt</div>
                {songs.map(s => (
                  <div key={s.id} className="admin-song-row">
                    <span>{s.title} — {s.uploader}</span>
                    <button className="btn-admin btn-danger btn-sm" disabled={adminBusy}
                      onClick={() => adminAction("delete-song", s.id)}>Ta bort</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}
