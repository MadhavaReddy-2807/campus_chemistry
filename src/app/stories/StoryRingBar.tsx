"use client";

import { useState, useEffect } from "react";
import { postStory, markStoryViewed } from "./actions";

export type StoryItem = {
  id: string;
  author_name: string;
  author_initials: string;
  author_handle: string;
  caption: string;
  background_style: string;
  created_at: string;
  is_mine?: boolean;
};

const SAMPLE_STORIES: StoryItem[] = [
  {
    id: "story-1",
    author_name: "Sneha Rao",
    author_initials: "SR",
    author_handle: "sneha_r",
    caption: "Sunset over Powai Lake after three consecutive labs. Campus feels magic today 🌅",
    background_style: "sunset-gradient",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "story-2",
    author_name: "Kabir Verma",
    author_initials: "KV",
    author_handle: "kabir_v",
    caption: "Anyone at the hostel 12 canteen up for a midnight chess match?",
    background_style: "night-gradient",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "story-3",
    author_name: "Ananya Deshmukh",
    author_initials: "AD",
    author_handle: "ananya_d",
    caption: "Inter-IIT tech meet preparations are in overdrive! Testing autonomous rovers tonight 🤖",
    background_style: "emerald-gradient",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "story-4",
    author_name: "Rohan Nair",
    author_initials: "RN",
    author_handle: "rohan_n",
    caption: "Coffee review at the new library café: 8.5/10 espresso, 10/10 playlist ☕🎶",
    background_style: "rose-gradient",
    created_at: new Date(Date.now() - 3600000 * 11).toISOString(),
  },
];

export function StoryRingBar({ initialStories = [] }: { initialStories?: StoryItem[] }) {
  const stories = initialStories.length > 0 ? initialStories : SAMPLE_STORIES;
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Auto-advance story timer
  useEffect(() => {
    if (activeStoryIndex === null) {
      return;
    }

    const story = stories[activeStoryIndex];
    if (story) {
      markStoryViewed(story.id);
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null && curr < stories.length - 1 ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // ~5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, stories]);

  function openStory(index: number) {
    setProgress(0);
    setActiveStoryIndex(index);
  }

  function nextStory() {
    setProgress(0);
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  }

  function prevStory() {
    setProgress(0);
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  }

  return (
    <div className="story-reel-container">
      <div className="story-reel">
        {/* Your Story Ring */}
        <button
          className="story-ring-item own-story"
          onClick={() => setShowComposer(true)}
          aria-label="Add to your 24-hour campus story"
        >
          <div className="story-circle own-circle">
            <span className="module-avatar">YOU</span>
            <span className="add-badge">+</span>
          </div>
          <small>Add Story</small>
        </button>

        {/* Peer Story Rings */}
        {stories.map((story, index) => (
          <button
            key={story.id}
            className="story-ring-item"
            onClick={() => openStory(index)}
            aria-label={`View story from ${story.author_name}`}
          >
            <div className={`story-circle ring-active ${story.background_style}`}>
              <span className="avatar avatar-plum">{story.author_initials}</span>
            </div>
            <small>{story.author_name.split(" ")[0]}</small>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="story-viewer-backdrop" onClick={() => setActiveStoryIndex(null)}>
          <div
            className={`story-viewer-card ${activeStory.background_style}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="story-progress-bar">
              <div className="story-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Story Header */}
            <div className="story-viewer-header">
              <div className="story-author-info">
                <span className="avatar avatar-plum">{activeStory.author_initials}</span>
                <div>
                  <strong>{activeStory.author_name}</strong>
                  <small>@{activeStory.author_handle} · 24h story</small>
                </div>
              </div>
              <button
                className="story-close-btn"
                onClick={() => setActiveStoryIndex(null)}
                aria-label="Close story"
              >
                ✕
              </button>
            </div>

            {/* Tap Navigation Zones */}
            <div className="story-tap-zone left-zone" onClick={prevStory} />
            <div className="story-tap-zone right-zone" onClick={nextStory} />

            {/* Content Body */}
            <div className="story-caption-content">
              <p>{activeStory.caption}</p>
            </div>

            {/* Quick Reply Form */}
            <div className="story-reply-box">
              <input
                placeholder={`Reply to ${activeStory.author_name.split(" ")[0]}…`}
                aria-label="Reply to story"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.value = "";
                    alert("Reply sent privately to their campus inbox!");
                  }
                }}
              />
              <button
                className="story-send-btn"
                onClick={() => alert("Reply sent privately to their campus inbox!")}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Composer Modal */}
      {showComposer && (
        <div className="modal-backdrop" onClick={() => setShowComposer(false)}>
          <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">NEW 24H STORY</span>
                <h2>What&apos;s happening right now?</h2>
              </div>
              <button className="round-action" onClick={() => setShowComposer(false)}>
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await postStory(null, formData);
                setShowComposer(false);
              }}
            >
              <textarea
                name="caption"
                required
                maxLength={300}
                placeholder="Share a campus moment, a question, or what you're working on today (disappears in 24 hours)..."
              />

              <div style={{ marginTop: "1rem" }}>
                <span className="eyebrow">Choose Color Accent</span>
                <div className="interest-row" style={{ marginTop: "0.5rem" }}>
                  <label className="interest-chip" style={{ cursor: "pointer" }}>
                    <input type="radio" name="backgroundStyle" value="rose-gradient" defaultChecked /> Warm Rose
                  </label>
                  <label className="interest-chip" style={{ cursor: "pointer" }}>
                    <input type="radio" name="backgroundStyle" value="sunset-gradient" /> Sunset Amber
                  </label>
                  <label className="interest-chip" style={{ cursor: "pointer" }}>
                    <input type="radio" name="backgroundStyle" value="emerald-gradient" /> Campus Emerald
                  </label>
                  <label className="interest-chip" style={{ cursor: "pointer" }}>
                    <input type="radio" name="backgroundStyle" value="night-gradient" /> Midnight Blue
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
                <span>Expires automatically after 24 hours</span>
                <button className="primary-button" type="submit">
                  Share Story <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
