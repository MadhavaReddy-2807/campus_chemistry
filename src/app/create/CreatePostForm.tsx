"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { createPost } from "./actions";

type ImagePreview = {
  file: File;
  previewUrl: string;
};

export function CreatePostForm() {
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("campus");
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError(null);
    const validImages: ImagePreview[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files (JPG, PNG, WebP) are supported.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB maximum limit.`);
        continue;
      }
      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedImages((prev) => [...prev, ...validImages].slice(0, 4));
    // Reset file input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim() && selectedImages.length === 0) {
      setError("Please write a caption or attach a photo before publishing.");
      return;
    }

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("body", body);
    formData.append("audience", audience);

    for (const img of selectedImages) {
      formData.append("mediaFiles", img.file);
    }

    try {
      await createPost(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post.");
      setPending(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", border: "1px solid var(--line, #e5e7eb)", borderRadius: "16px", padding: "24px" }}>
      {error && (
        <div
          className="form-error"
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            padding: 12,
            background: "#fff1f0",
            border: "1px solid #f2c2bd",
            borderRadius: 8,
            fontSize: 13,
            color: "#dc2626",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs: Write vs Preview */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--line, #e5e7eb)", marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          style={{
            padding: "8px 14px",
            background: "none",
            border: 0,
            borderBottom: !isPreview ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
            color: !isPreview ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
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
            borderBottom: isPreview ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
            color: isPreview ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
            fontWeight: isPreview ? 700 : 500,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div style={{ minHeight: 180, padding: 14, background: "#fbf9f5", borderRadius: 10, border: "1px solid var(--line, #e5e7eb)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--ink, #111827)" }}>
            {body || <span style={{ color: "var(--muted, #6b7280)" }}>No caption provided.</span>}
          </p>

          {selectedImages.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: selectedImages.length > 1 ? "repeat(2, 1fr)" : "1fr",
                gap: 8,
                marginTop: 14,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {selectedImages.map((img, i) => (
                <img
                  key={i}
                  src={img.previewUrl}
                  alt={`Preview ${i + 1}`}
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 6 }}
                />
              ))}
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
              placeholder="What's happening on campus? Share a project, announcement, or question..."
              maxLength={2200}
              rows={5}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid var(--line, #e5e7eb)",
                borderRadius: "10px",
                background: "#fbf9f5",
                fontSize: 14,
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>{body.length} / 2200</span>
            </div>
          </div>

          {/* Direct File Picker Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink, #111827)", marginBottom: 8 }}>
              Photos (Optional)
            </label>

            {/* Thumbnail Gallery of Selected Images */}
            {selectedImages.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                {selectedImages.map((img, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: 90,
                      height: 90,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid var(--line, #e5e7eb)",
                    }}
                  >
                    <img
                      src={img.previewUrl}
                      alt="Thumbnail"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.65)",
                        color: "#ffffff",
                        border: 0,
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                      aria-label="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedImages.length < 4 && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  style={{ display: "none" }}
                  id="media-file-input"
                />
                <label
                  htmlFor="media-file-input"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px dashed var(--line, #cbd5e1)",
                    background: "#fbf9f5",
                    fontSize: 13,
                    color: "var(--ink, #374151)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <ImagePlus size={16} />
                  <span>{selectedImages.length === 0 ? "Select photos from device" : "Add more photos"}</span>
                </label>
                <small style={{ display: "block", color: "var(--muted, #9ca3af)", fontSize: 11, marginTop: 4 }}>
                  Up to 4 images (PNG, JPG, WebP), max 10MB each.
                </small>
              </div>
            )}
          </div>

          {/* Visibility selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink, #111827)", marginBottom: 6 }}>
              Audience &amp; Visibility
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--line, #e5e7eb)",
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
              disabled={pending || (!body.trim() && selectedImages.length === 0)}
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
