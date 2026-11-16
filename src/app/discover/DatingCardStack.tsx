"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Flag,
  Ban,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { sendDiscoveryAction } from "./actions";
import { blockUser } from "@/app/profile/actions";

export type DatingProfile = {
  id: string;
  name: string;
  username: string;
  age?: number;
  campus?: string;
  bio?: string | null;
  relationship_intention?: string;
  interests: string[];
  photos: string[];
  verified?: boolean;
};

export function DatingCardStack({
  profiles,
  currentUserAvatar,
  currentUserName,
}: {
  profiles: DatingProfile[];
  currentUserAvatar?: string | null;
  currentUserName?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<{
    profile: DatingProfile;
    conversationId?: string;
  } | null>(null);

  const currentProfile = profiles[currentIndex];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    if (photoIndex < currentProfile.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else {
      setPhotoIndex(currentProfile.photos.length - 1);
    }
  };

  const handleAction = async (action: "like" | "pass") => {
    if (!currentProfile || isPending) return;
    setIsPending(true);
    setShowMenu(false);

    try {
      const result = await sendDiscoveryAction(currentProfile.id, action);
      if (action === "like" && result?.matchId) {
        setMatchedProfile({
          profile: currentProfile,
          conversationId: result.conversationId,
        });
      }
    } catch (err) {
      console.error("Discovery action failed:", err);
    } finally {
      setIsPending(false);
      setCurrentIndex((prev) => prev + 1);
      setPhotoIndex(0);
    }
  };

  const handleBlock = async () => {
    if (!currentProfile) return;
    if (confirm(`Block ${currentProfile.name}? They will not appear in dating or feeds.`)) {
      await blockUser(currentProfile.id);
      setCurrentIndex((prev) => prev + 1);
      setPhotoIndex(0);
    }
  };

  // If stack is exhausted
  if (!currentProfile) {
    return (
      <div
        style={{
          maxWidth: 440,
          margin: "40px auto",
          padding: "48px 24px",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid var(--line, #e5e7eb)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fdf2f0",
            color: "var(--rose, #e11d48)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #111827)", margin: "0 0 8px" }}>
          You&apos;re all caught up!
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted, #6b7280)", margin: "0 0 24px", lineHeight: 1.5 }}>
          You have reviewed all available profiles in your discovery pool. Check back soon as more verified IIT and NIT students opt into dating.
        </p>
        <Link href="/" className="primary-button" style={{ display: "inline-block", fontSize: 13, padding: "10px 20px" }}>
          Return to campus feed
        </Link>
      </div>
    );
  }

  const currentPhoto = currentProfile.photos[photoIndex] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "10px 0 30px" }}>
      {/* Dating Card Container */}
      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid var(--line, #e5e7eb)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* Large Profile Photo Area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 480,
            background: "#1f2937",
            userSelect: "none",
          }}
        >
          <img
            src={currentPhoto}
            alt={currentProfile.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Photo Navigation Indicators / Dots */}
          {currentProfile.photos.length > 1 && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                right: 12,
                display: "flex",
                gap: 5,
                zIndex: 10,
              }}
            >
              {currentProfile.photos.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: idx === photoIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                    transition: "background 0.2s ease",
                  }}
                />
              ))}
            </div>
          )}

          {/* Touch navigation zones for photos (left / right half) */}
          <button
            type="button"
            onClick={handlePrevPhoto}
            aria-label="Previous photo"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              paddingLeft: 8,
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ background: "rgba(0,0,0,0.5)", borderRadius: "50%", padding: 6, color: "#fff" }}>
              <ChevronLeft size={20} />
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextPhoto}
            aria-label="Next photo"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 8,
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ background: "rgba(0,0,0,0.5)", borderRadius: "50%", padding: 6, color: "#fff" }}>
              <ChevronRight size={20} />
            </span>
          </button>

          {/* Top Options & Full Profile View */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 12,
              display: "flex",
              gap: 8,
              zIndex: 15,
            }}
          >
            <Link
              href={`/u/${currentProfile.username}`}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                backdropFilter: "blur(4px)",
              }}
              title="View full social profile"
            >
              <ExternalLink size={16} />
            </Link>

            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                color: "#ffffff",
                border: 0,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
              aria-label="Dating options"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: 64,
                right: 12,
                background: "#ffffff",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                zIndex: 30,
                minWidth: 150,
                overflow: "hidden",
              }}
            >
              <Link
                href={`/safety/report?target=${currentProfile.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#dc2626",
                  textDecoration: "none",
                }}
              >
                <Flag size={14} />
                <span>Report profile</span>
              </Link>
              <button
                type="button"
                onClick={handleBlock}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  background: "none",
                  border: 0,
                  fontSize: 12,
                  color: "#dc2626",
                  cursor: "pointer",
                }}
              >
                <Ban size={14} />
                <span>Block student</span>
              </button>
            </div>
          )}

          {/* Photo bottom gradient overlay with quick name info */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "40px 20px 16px",
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
              color: "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>
                {currentProfile.name}
                {currentProfile.age ? `, ${currentProfile.age}` : ""}
              </span>
              {currentProfile.verified && (
                <CheckCircle2 size={18} style={{ color: "#22c55e", alignSelf: "center" }} aria-label="Verified IIT/NIT" />
              )}
            </div>
            {currentProfile.campus && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#ffd1c7",
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 8px",
                  borderRadius: 8,
                }}
              >
                {currentProfile.campus}
              </span>
            )}
          </div>
        </div>

        {/* Vertical Profile Details */}
        <div style={{ padding: "20px 20px 24px" }}>
          {/* Relationship Intention Pill */}
          {currentProfile.relationship_intention && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                background: "#fef2f2",
                border: "1px solid #fecdd3",
                color: "#be123c",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              <span>Looking for:</span>
              <span>{currentProfile.relationship_intention}</span>
            </div>
          )}

          {/* Bio */}
          {currentProfile.bio && (
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--ink, #1f2937)",
                whiteSpace: "pre-wrap",
              }}
            >
              {currentProfile.bio}
            </p>
          )}

          {/* Interests */}
          {currentProfile.interests.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {currentProfile.interests.map((interest) => (
                <span
                  key={interest}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                    fontSize: 12,
                    color: "var(--ink, #374151)",
                    fontWeight: 500,
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Large Accessible Action Controls: Pass (X) and Like (Heart) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              alignItems: "center",
              paddingTop: 8,
              borderTop: "1px solid var(--line, #f3f4f6)",
            }}
          >
            {/* Pass Button */}
            <button
              type="button"
              onClick={() => handleAction("pass")}
              disabled={isPending}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#ffffff",
                border: "2px solid #e5e7eb",
                color: "#6b7280",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
              }}
              aria-label="Pass"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => handleAction("like")}
              disabled={isPending}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                border: 0,
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(225,29,72,0.35)",
                transition: "all 0.15s ease",
              }}
              aria-label="Like"
            >
              <Heart size={28} fill="#ffffff" stroke="#ffffff" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Celebration Modal */}
      {matchedProfile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 380,
              width: "100%",
              background: "#ffffff",
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              animation: "popIn 0.3s ease",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#e11d48",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <Heart size={30} fill="#e11d48" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--ink, #111827)" }}>
              It&apos;s a Match!
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted, #4b5563)", margin: "0 0 24px", lineHeight: 1.5 }}>
              You and <strong>{matchedProfile.profile.name}</strong> both liked each other.
            </p>

            {/* Avatars side-by-side */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 28 }}>
              {currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt={currentUserName || "You"}
                  style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid #e11d48" }}
                />
              ) : (
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "var(--plum, #4a2c35)",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    border: "3px solid #e11d48",
                  }}
                >
                  {currentUserName ? currentUserName.slice(0, 2).toUpperCase() : "CC"}
                </div>
              )}

              <Heart size={20} fill="#e11d48" color="#e11d48" />

              <img
                src={matchedProfile.profile.photos[0]}
                alt={matchedProfile.profile.name}
                style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid #e11d48" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {matchedProfile.conversationId ? (
                <Link
                  href={`/messages/${matchedProfile.conversationId}`}
                  className="primary-button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px",
                    fontSize: 14,
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Send a Message</span>
                </Link>
              ) : (
                <Link
                  href="/messages"
                  className="primary-button"
                  style={{ padding: "12px", fontSize: 14 }}
                >
                  Open Messages
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMatchedProfile(null)}
                className="secondary-button"
                style={{ padding: "12px", fontSize: 13 }}
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
