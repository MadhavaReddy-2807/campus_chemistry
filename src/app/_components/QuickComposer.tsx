"use client";

import { useState } from "react";
import { createPost } from "@/app/create/actions";

export function QuickComposer({ user }: { user?: { display_name?: string; name?: string; campus_short?: string; campus?: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("campus");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const initials = (user?.display_name || "You").slice(0, 2).toUpperCase();

  return (
    <div
      className="quick-card"
      style={{
        background: "#ffffff",
        border: "1px solid var(--line)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--plum)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            flex: 1,
            textAlign: "left",
            padding: "10px 16px",
            borderRadius: "24px",
            border: "1px solid var(--line)",
            background: "#fbf9f5",
            color: "var(--muted)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Share an update with your campus...
        </button>
      </div>

      {isOpen && (
        <form
          action={async (formData) => {
            await createPost(formData);
            setIsOpen(false);
            setBody("");
            setImageUrl("");
          }}
          style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}
        >
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's happening on campus? Share projects, questions, or ideas..."
            required
            maxLength={2200}
            rows={3}
            autoFocus
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--line)",
              borderRadius: "10px",
              background: "#fbf9f5",
              fontSize: 14,
              resize: "vertical",
            }}
          />

          {showImageInput && (
            <div style={{ marginTop: 10 }}>
              <input
                name="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (https://...)"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  fontSize: 13,
                }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                name="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "#fbf9f5",
                  fontSize: 12,
                  color: "var(--ink)",
                }}
              >
                <option value="campus">My campus</option>
                <option value="public">All verified campuses</option>
                <option value="followers">Followers only</option>
              </select>

              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                style={{
                  background: "none",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                📷 {showImageInput ? "Remove image" : "Add image"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="secondary-button"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={!body.trim()}
                style={{ padding: "8px 16px", fontSize: 12 }}
              >
                Post <span>→</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
