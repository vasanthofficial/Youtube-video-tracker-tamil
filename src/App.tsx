import { useState, useEffect, useRef } from "react";
const TOTAL = 100;
// const STORAGE_KEY = "video_uploads";
// async function loadFromStorage() {
//   try {
//     const result = await window.storage.get(STORAGE_KEY);
//     if (result?.value) return JSON.parse(result.value);
//   } catch {}
//   return { uploads: [] };
// }
// async function saveToStorage(data) {
//   try {
//     await window.storage.set(STORAGE_KEY, JSON.stringify(data));
//   } catch {}
// }
const STORAGE_KEY = "video_uploads";

function loadFromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : { uploads: [] };
  } catch {
    return { uploads: [] };
  }
}

function saveToStorage(data: { uploads: any[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  // const [data, setData] = useState({ uploads: [] });
  const [input, setInput] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // const [toast, setToast] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setData(loadFromStorage());
    setLoaded(true);
  }, []);

  type Upload = {
    id: number;
    title: string;
    date: string;
  };

  type DataType = {
    uploads: Upload[];
  };
  const [data, setData] = useState<DataType>({ uploads: [] });
  const [toast, setToast] = useState<{
    msg: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (loaded) saveToStorage(data);
  }, [data, loaded]);
  // const [toast, setToast] = useState(null);
  const showToast = (msg: string, color = "#22c55e") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const uploads = data.uploads || [];
  const done = uploads.length;
  const remaining = TOTAL - done;
  const pct = Math.round((done / TOTAL) * 100);
  const addUpload = () => {
    const title = input.trim() || `Video ${done + 1}`;
    if (done >= TOTAL) return;
    const newUploads = [
      ...uploads,
      { id: Date.now(), title, date: new Date().toLocaleDateString("en-IN") },
    ];
    setData({ uploads: newUploads });
    setInput("");
    setAnimKey((k) => k + 1);
    showToast(`✓ "${title}" logged`);
  };
  const removeLast = () => {
    if (uploads.length === 0) return;
    const removed = uploads[uploads.length - 1].title;
    setData({ uploads: uploads.slice(0, -1) });
    showToast(`↩ Removed "${removed}"`, "#f59e0b");
  };
  const reset = () => {
    if (window.confirm("Reset all progress? This cannot be undone.")) {
      setData({ uploads: [] });
      showToast("Progress reset", "#ef4444");
    }
  };
  const exportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      total: TOTAL,
      done,
      uploads,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(" Backup downloaded!");
  };
  const triggerImport = () => fileInputRef.current?.click();
  // const handleImport = (e: { target: { files: any[]; value: string } }) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setImporting(true);
  //   const reader = new FileReader();
  //   reader.onload = (ev) => {
  //     try {
  //       // const parsed = JSON.parse(ev.target.result);
  //       const result = ev.target?.result;

  //       if (typeof result !== "string") {
  //         throw new Error("Invalid file");
  //       }

  //       const parsed = JSON.parse(result);
  //       if (!Array.isArray(parsed.uploads)) throw new Error("Invalid format");
  //       if (
  //         window.confirm(
  //           `Import ${parsed.uploads.length} uploads from backup?\nThis will REPLACE your current progress.`,
  //         )
  //       ) {
  //         setData({ uploads: parsed.uploads });
  //         showToast(`✓ Imported ${parsed.uploads.length} uploads`);
  //       }
  //     } catch {
  //       showToast(" Invalid backup file", "#ef4444");
  //     }
  //     setImporting(false);
  //     e.target.value = "";
  //   };
  //   reader.readAsText(file);
  // };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();

    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        const result = ev.target?.result;

        if (typeof result !== "string") {
          throw new Error("Invalid file");
        }

        const parsed = JSON.parse(result);

        if (!Array.isArray(parsed.uploads)) {
          throw new Error("Invalid format");
        }

        if (
          window.confirm(
            `Import ${parsed.uploads.length} uploads from backup?\nThis will REPLACE your current progress.`,
          )
        ) {
          setData({ uploads: parsed.uploads });
          showToast(`✓ Imported ${parsed.uploads.length} uploads`);
        }
      } catch {
        showToast(" Invalid backup file", "#ef4444");
      }

      setImporting(false);
      e.target.value = "";
    };

    reader.readAsText(file);
  };
  const bars = Array.from({ length: 10 }, (_, i) => {
    const start = i * 10;
    const filled = Math.min(Math.max(done - start, 0), 10);
    return { label: `${start + 1}–${start + 10}`, filled };
  });
  const statusColor = pct < 30 ? "#ef4444" : pct < 70 ? "#f59e0b" : "#22c55e";
  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#475569",
          fontFamily: "Courier New, monospace",
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
        }}
      >
        LOADING...
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e8f0",
        fontFamily: "'Courier New', monospace",
        padding: "2rem 1rem",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#111827",
            border: `1px solid ${toast.color}44`,
            color: toast.color,
            padding: "0.6rem 1rem",
            borderRadius: 8,
            fontSize: "0.78rem",
            fontFamily: "Courier New, monospace",
            zIndex: 999,
            boxShadow: `0 0 12px ${toast.color}22`,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}
          >
            Experiment Tracker
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              margin: 0,
              color: "#f8fafc",
              letterSpacing: "-0.02em",
            }}
          >
            100 Video Upload - Tamil Channel
          </h1>
          <div
            style={{
              fontSize: "0.72rem",
              color: "#475569",
              marginTop: "0.3rem",
            }}
          >
            Auto-saves in browser • Export to back up • Import to restore
          </div>
        </div>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Uploaded", value: done, color: "#22c55e" },
            { label: "Remaining", value: remaining, color: "#f59e0b" },
            { label: "Progress", value: `${pct}%`, color: statusColor },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "#111827",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: "1.2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#64748b",
                  marginTop: 4,
                  letterSpacing: "0.1em",
                }}
              >
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        {/* Bar Chart */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#64748b",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            Upload Progress — Groups of 10
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 140,
            }}
          >
            {bars.map((bar, i) => {
              const heightPct = (bar.filled / 10) * 100;
              const isActive = bar.filled > 0 && bar.filled < 10;
              const isDone = bar.filled === 10;
              const barColor = isDone
                ? "#22c55e"
                : isActive
                  ? "#f59e0b"
                  : "#1e293b";

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.55rem",
                      color: isDone
                        ? "#22c55e"
                        : isActive
                          ? "#f59e0b"
                          : "#334155",
                      fontWeight: "bold",
                    }}
                  >
                    {bar.filled > 0 ? bar.filled : ""}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      background: "#1e293b",
                      borderRadius: 6,
                      height: 110,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      key={`${animKey}-${i}`}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${heightPct}%`,
                        background: barColor,
                        borderRadius: 6,
                        transition: "height 0.5s ease",
                        boxShadow: isDone
                          ? "0 0 8px #22c55e66"
                          : isActive
                            ? "0 0 8px #f59e0b66"
                            : "none",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.5rem", color: "#334155" }}>
                    {bar.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
              fontSize: "0.65rem",
              color: "#64748b",
            }}
          >
            {[
              { color: "#22c55e", label: "Complete" },
              { color: "#f59e0b", label: "In Progress" },
              { color: "#1e293b", label: "Not Started" },
            ].map(({ color, label }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: color,
                    borderRadius: 2,
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
        {/* Overall progress bar */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.65rem",
              color: "#64748b",
              marginBottom: 8,
              letterSpacing: "0.1em",
            }}
          >
            <span>OVERALL</span>
            <span style={{ color: statusColor }}>{pct}%</span>
          </div>
          <div
            style={{
              height: 8,
              background: "#1e293b",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: `linear-gradient(90deg, #22c55e, ${statusColor})`,
                borderRadius: 99,
                transition: "width 0.5s ease",
                boxShadow: `0 0 10px ${statusColor}66`,
              }}
            />
          </div>
        </div>
        {/* Log Upload */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#64748b",
              marginBottom: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Log Upload
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUpload()}
              placeholder={
                done < TOTAL
                  ? `Video ${done + 1} title (optional)`
                  : "All 100 done! "
              }
              disabled={done >= TOTAL}
              style={{
                flex: 1,
                background: "#0a0a0f",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "0.6rem 0.8rem",
                color: "#e2e8f0",
                fontFamily: "inherit",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={addUpload}
              disabled={done >= TOTAL}
              style={{
                background: done >= TOTAL ? "#1e293b" : "#22c55e",
                color: done >= TOTAL ? "#475569" : "#000",
                border: "none",
                borderRadius: 8,
                padding: "0.6rem 1.2rem",
                fontFamily: "inherit",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: done >= TOTAL ? "not-allowed" : "pointer",
                letterSpacing: "0.05em",
              }}
            >
              + Upload
            </button>
          </div>
        </div>
        {/* Recent uploads */}
        {uploads.length > 0 && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "#64748b",
                marginBottom: "0.8rem",
                textTransform: "uppercase",
              }}
            >
              Recent Uploads (last 5)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...uploads]
                .reverse()
                .slice(0, 5)
                .map((u, i) => (
                  <div
                    key={u.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0",
                      borderBottom: i < 4 ? "1px solid #1e293b" : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ color: "#22c55e", fontSize: "0.65rem" }}>
                        #{uploads.length - i}
                      </span>
                      <span style={{ color: "#cbd5e1" }}>{u.title}</span>
                    </div>
                    <span style={{ color: "#475569", fontSize: "0.7rem" }}>
                      {u.date}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Backup & Controls */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "1.2rem 1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#64748b",
              marginBottom: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Backup & Restore
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={exportJSON}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Export Backup
            </button>
            <button
              onClick={triggerImport}
              disabled={importing}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Import Backup
            </button>
            <div style={{ flex: 1 }} />

            <button
              onClick={removeLast}
              disabled={uploads.length === 0}
              style={{
                background: "transparent",
                border: "1px solid #1e293b",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                cursor: uploads.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              ↩ Undo Last
            </button>
            <button
              onClick={reset}
              style={{
                background: "transparent",
                border: "1px solid #ef444433",
                color: "#ef4444",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Reset All
            </button>
          </div>
          <div
            style={{
              fontSize: "0.62rem",
              color: "#334155",
              marginTop: "0.7rem",
            }}
          >
            Auto-saves in this browser tab • Export .json to keep a copy or move
            to another device
          </div>
        </div>
        {done >= TOTAL && (
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              padding: "1.5rem",
              background: "#052e16",
              border: "1px solid #22c55e44",
              borderRadius: 12,
              color: "#22c55e",
              fontWeight: "bold",
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
            }}
          >
            Experiment Complete! All 100 videos uploaded.
          </div>
        )}
      </div>
    </div>
  );
}
