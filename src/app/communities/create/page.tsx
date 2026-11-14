import Link from "next/link";
import { ModuleHeader } from "@/app/_components/DataState";
import { createCommunity } from "../actions";

export default function CreateCommunityPage() {
  const categories = [
    "Tech & Coding",
    "Creative & Arts",
    "Music & Jamming",
    "Sports & Fitness",
    "Literature & Debating",
    "Gaming & Anime",
    "Entrepreneurship",
    "Research & Academia",
  ];

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <Link href="/communities" className="text-button module-back">
          Back to all clubs <span>←</span>
        </Link>
      </div>

      <ModuleHeader
        eyebrow="START A NEW SPACE"
        title="Create a Campus Community"
        body="Whether it's an inter-IIT/NIT developer group, a campus robotics club, or a midnight poetry guild, bring students together."
      />

      <div className="onboarding-shell" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form action={createCommunity} className="create-community-form">
          <label>
            <strong>Club / Community Name</strong>
            <input
              name="name"
              required
              minLength={3}
              maxLength={100}
              placeholder="e.g. Aeromodelling & Drone Guild"
            />
          </label>

          <label>
            <strong>Category</strong>
            <select name="category" required defaultValue="Tech & Coding">
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label>
            <strong>Description & Mission</strong>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              placeholder="What is this community about? Who is it for, and what can members expect?"
            />
          </label>

          <button className="primary-button" type="submit" style={{ marginTop: "1.5rem" }}>
            Publish Community <span>→</span>
          </button>
        </form>
      </div>
    </main>
  );
}
