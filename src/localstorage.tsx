import { useState, useEffect } from "react";

const TOTAL = 100;
const STORAGE_KEY = "video_uploads";

type Upload = {
  id: number;
  title: string;
  date: string;
};

type Data = {
  uploads: Upload[];
};

function loadFromStorage(): Data {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : { uploads: [] };
  } catch {
    return { uploads: [] };
  }
}

function saveToStorage(data: Data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [data, setData] = useState<Data>({ uploads: [] });
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveToStorage(data);
  }, [data, loaded]);

  const uploads = data.uploads;
  const done = uploads.length;
  const pct = Math.round((done / TOTAL) * 100);

  const addUpload = () => {
    const title = input || `Video ${done + 1}`;

    setData({
      uploads: [
        ...uploads,
        {
          id: Date.now(),
          title,
          date: new Date().toLocaleDateString(),
        },
      ],
    });

    setInput("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e8f0",
        padding: "2rem",
        fontFamily: "Courier New",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        🎯 100 Video Tracker
      </h1>

      <div style={{ marginTop: "1rem" }}>
        <p>Uploaded: {done}</p>
        <p>Progress: {pct}%</p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: 10,
          background: "#1e293b",
          borderRadius: 10,
          margin: "1rem 0",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#22c55e",
            borderRadius: 10,
          }}
        />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Video title"
          style={{
            flex: 1,
            padding: "8px",
            background: "#111827",
            color: "white",
            border: "1px solid #1e293b",
          }}
        />
        <button
          onClick={addUpload}
          style={{
            background: "#22c55e",
            border: "none",
            padding: "8px 16px",
          }}
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul style={{ marginTop: "1rem" }}>
        {uploads.map((u) => (
          <li key={u.id}>
            {u.title} — {u.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
