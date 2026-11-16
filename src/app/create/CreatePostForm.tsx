"use client";

import { useState } from "react";
import { createPost } from "./actions";

export function CreatePostForm() {
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("campus");
  const [imageUrl, setImageUrl] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim()) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("body", body);
    formData.append("audience", audience);
    if (imageUrl.trim()) {
      formData.append("imageUrl", imageUrl.trim());
    }

    try {
      await createPost(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post.");
      setPending(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px" }}>
      {error && (
        <div className="form-error" role="alert" style={{ marginBottom: 16, padding: 12, background: "#fff1f0", border: "1px solid #f2c2bd", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {/* Tabs: Write vs Preview */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          style={{
            padding: "8px 14px",
            background: "none",
            border: 0,
            borderBottom: !isPreview ? "2px solid var(--plum)" : "2px solid transparent",
            color: !isPreview ? "var(--plum)" : "var(--muted)",
            fontWeight: !isPreview ? 700 : 500,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Write post
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          style={{
            padding: "8px 14px",
            background: "none",
            border: 0,
            borderBottom: isPreview ? "2px solid var(--plum)" : "2px solid transparent",
            color: isPreview ? "var(--plum)" : "var(--muted)",
            fontWeight: isPreview ? 700 : 500,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div style={{ minHeight: 180, padding: 14, background: "#fbf9f5", borderRadius: 10, border: "1px solid var(--line)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--ink)" }}>
            {body || <span style={{ color: "var(--muted)" }}>Nothing written yet.</span>}
          </p>
          {imageUrl && (
            <div style={{ marginTop: 12 }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8 }}
                onError={() => setError("Image URL appears invalid or could not be loaded.")}
              />
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's happening on campus? Share a question, study idea, or project update..."
              required
              maxLength={2200}
              rows={6}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                background: "#fbf9f5",
                fontSize: 14,
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--soft)" }}>{body.length} / 2200</span>
            </div>
          </div>

          {/* Image attachment */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
              Attach Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or hosted image link"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--line)",
                borderRadius: 8,
                background: "#fbf9f5",
                fontSize: 13,
              }}
            />
          </div>

          {/* Visibility selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
              Audience &amp; Visibility
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--line)",
                borderRadius: 8,
                background: "#fbf9f5",
                fontSize: 13,
              }}
            >
              <option value="campus">My Campus (Visible to verified students from your institute)</option>
              <option value="public">All Campuses (Cross-campus network feed)</option>
              <option value="followers">Followers only</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="primary-button"
              type="submit"
              disabled={pending || !body.trim()}
              style={{ padding: "12px 24px", fontSize: 13 }}
            >
              {pending ? "Publishing…" : "Publish post"} <span>→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
