import Link from "next/link";
import { connection } from "next/server";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DatingCardStack, type DatingProfile } from "./DatingCardStack";
import { toggleDatingOptIn } from "./actions";

export const instant = false;

export default async function DiscoverPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <h2>Database connection required</h2>
        <p>Supabase environment variables are missing.</p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Sign in to discover students</h1>
        <p style={{ color: "var(--muted, #6b7280)", fontSize: 13, margin: "0 0 20px" }}>
          Campus dating discovery is reserved exclusively for verified IIT and NIT students.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", fontSize: 13, padding: "10px 24px" }}>
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch current user's profile and dating settings
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, dating_enabled, dating_visibility, verification_status, date_of_birth, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instObj = myProfile?.institutes as any;
  const myCampusShort = instObj ? (Array.isArray(instObj) ? instObj[0]?.short_name : instObj.short_name) : undefined;

  const userShellSummary = myProfile
    ? {
        name: myProfile.display_name,
        username: myProfile.username,
        avatar_url: myProfile.avatar_url,
        campus: myCampusShort,
      }
    : undefined;

  // If user has not opted into dating or dating is disabled
  if (!myProfile?.dating_enabled) {
    return (
      <AppShell activeTab="Date" user={userShellSummary}>
        <div style={{ maxWidth: 500, margin: "32px auto", padding: "32px 24px", background: "#ffffff", borderRadius: 20, border: "1px solid var(--line, #e5e7eb)", textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#e11d48",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <Heart size={28} fill="#e11d48" />
          </div>

          <span className="eyebrow" style={{ color: "#e11d48" }}>CAMPUS CHEMISTRY DATING</span>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 10px", color: "var(--ink, #111827)" }}>
            Mutual Discovery, Exclusively for IIT &amp; NIT Students
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted, #4b5563)", margin: "0 0 20px", lineHeight: 1.6 }}>
            Dating mode is 100% opt-in and private. One-sided likes remain secret until mutual interest is established.
          </p>

          <div
            style={{
              background: "#f9fafb",
              borderRadius: 12,
              padding: "16px",
              textAlign: "left",
              marginBottom: 24,
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.5,
              border: "1px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <ShieldCheck size={18} style={{ color: "#059669", flexShrink: 0, marginTop: 1 }} />
              <span>Only verified, active IIT/NIT student profiles can be matched with you.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Sparkles size={18} style={{ color: "#e11d48", flexShrink: 0, marginTop: 1 }} />
              <span>You must be at least 18 years of age. You can pause or leave dating mode at any time.</span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await toggleDatingOptIn(true);
            }}
          >
            <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
              Enable Dating Mode (18+)
            </button>
          </form>
        </div>
      </AppShell>
    );
  }

  // Fetch already acted upon candidate IDs (likes, passes) to not repeat
  const { data: actedData } = await supabase
    .from("discovery_actions")
    .select("target_id")
    .eq("actor_id", user.id);

  const excludedIds = [user.id, ...(actedData || []).map((a) => a.target_id)];

  // Fetch candidate dating profiles
  const { data: candidates } = await supabase
    .from("profiles")
    .select(`
      id, display_name, username, bio, study_year, date_of_birth, verification_status,
      institutes ( name, short_name ),
      profile_photos ( id, storage_path, sort_order ),
      discovery_preferences ( relationship_intentions ),
      user_interests ( interest:interests ( id, name ) )
    `)
    .eq("dating_enabled", true)
    .eq("dating_visibility", true)
    .eq("verification_status", "verified")
    .not("id", "in", `(${excludedIds.join(",")})`)
    .limit(25);

  const datingProfiles: DatingProfile[] = (candidates || []).map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cInst = c.institutes as any;
    const campus = cInst ? (Array.isArray(cInst) ? cInst[0]?.short_name : cInst.short_name) : undefined;

    // Photos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawPhotos = (c.profile_photos as any[]) || [];
    rawPhotos.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const photos = rawPhotos.map((p) => p.storage_path).filter(Boolean);

    // If no custom photos, fallback to portrait placeholder
    if (photos.length === 0) {
      photos.push("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80");
    }

    // Interests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawInterests = (c.user_interests as any[]) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interests = rawInterests.map((item: any) => item.interest?.name).filter(Boolean);

    // Age
    let age: number | undefined;
    if (c.date_of_birth) {
      age = new Date().getFullYear() - new Date(c.date_of_birth).getFullYear();
    }

    // Relationship Intention
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefs = c.discovery_preferences as any;
    const intentions = prefs ? (Array.isArray(prefs) ? prefs[0]?.relationship_intentions : prefs.relationship_intentions) : undefined;
    const intention = Array.isArray(intentions) && intentions.length > 0 ? intentions[0] : undefined;

    return {
      id: c.id,
      name: c.display_name,
      username: c.username,
      age,
      campus,
      bio: c.bio,
      relationship_intention: intention,
      interests,
      photos,
      verified: c.verification_status === "verified",
    };
  });

  return (
    <AppShell activeTab="Date" user={userShellSummary}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 80px" }}>
        {/* Dating Mode Header / Toggle Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink, #111827)" }}>
              Dating Mode
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "#ecfdf5", color: "#059669", fontWeight: 600 }}>
              Active
            </span>
          </div>

          <form
            action={async () => {
              "use server";
              await toggleDatingOptIn(false);
            }}
          >
            <button
              type="submit"
              style={{
                background: "none",
                border: 0,
                color: "var(--muted, #6b7280)",
                fontSize: 12,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Pause Dating
            </button>
          </form>
        </div>

        {/* Card Stack */}
        <DatingCardStack
          profiles={datingProfiles}
          currentUserAvatar={myProfile.avatar_url}
          currentUserName={myProfile.display_name}
        />
      </div>
    </AppShell>
  );
}
