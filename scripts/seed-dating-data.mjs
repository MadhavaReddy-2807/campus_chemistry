import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.CAMPUS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected to DB, seeding dating profiles...");

// High-quality diverse campus and student portrait images
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
];

const INTENTIONS = [
  "Long-term relationship",
  "Campus coffee & study dates",
  "Someone to explore fests with",
  "Deep tech talks & late night tea",
  "Open to see where things go",
];

// 1. Fetch 36 synthetic demo profiles to enable dating on
const { rows: demoProfiles } = await client.query(
  "SELECT id, username, display_name FROM public.profiles WHERE id != '9d02f95d-a7d1-4df4-9f3f-61531fb0daa0' ORDER BY created_at ASC LIMIT 40"
);

console.log(`Enabling dating on ${demoProfiles.length} student profiles...`);

for (let i = 0; i < demoProfiles.length; i++) {
  const p = demoProfiles[i];
  const isFemale = i % 2 === 0;
  const age = 19 + (i % 4);
  const birthYear = 2026 - age;
  const dob = `${birthYear}-0${(i % 9) + 1}-15`;
  const gender = isFemale ? "female" : "male";
  const intention = INTENTIONS[i % INTENTIONS.length];

  // Update profile
  await client.query(
    `UPDATE public.profiles
     SET dating_enabled = true,
         dating_visibility = true,
         date_of_birth = $1::date,
         gender = $2,
         verification_status = 'verified',
         cross_campus_visibility = true
     WHERE id = $3`,
    [dob, gender, p.id]
  );

  // Set discovery preferences
  await client.query(
    `INSERT INTO public.discovery_preferences (user_id, min_age, max_age, preferred_genders, relationship_intentions, allow_cross_campus, same_campus_only, updated_at)
     VALUES ($1, 18, 26, ARRAY['male', 'female'], ARRAY[$2::text], true, false, now())
     ON CONFLICT (user_id) DO UPDATE SET
       allow_cross_campus = true,
       same_campus_only = false,
       preferred_genders = ARRAY['male', 'female'],
       relationship_intentions = ARRAY[$2::text],
       updated_at = now()`,
    [p.id, intention]
  );

  // Add 2 photos to profile_photos
  const photo1 = SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length];
  const photo2 = SAMPLE_PHOTOS[(i + 4) % SAMPLE_PHOTOS.length];

  await client.query("DELETE FROM public.profile_photos WHERE user_id = $1", [p.id]);

  await client.query(
    `INSERT INTO public.profile_photos (user_id, storage_path, sort_order, alt_text)
     VALUES ($1, $2, 0, 'Profile portrait'), ($1, $3, 1, 'Campus life')`,
    [p.id, photo1, photo2]
  );
}

// 2. Also ensure admin user Madhava has dating enabled for testing
await client.query(
  `UPDATE public.profiles
   SET dating_enabled = true,
       dating_visibility = true,
       date_of_birth = '2003-04-10'::date,
       gender = 'male',
       verification_status = 'verified',
       cross_campus_visibility = true
   WHERE id = '9d02f95d-a7d1-4df4-9f3f-61531fb0daa0'`
);

await client.query(
  `INSERT INTO public.discovery_preferences (user_id, min_age, max_age, preferred_genders, relationship_intentions, allow_cross_campus, same_campus_only, updated_at)
   VALUES ('9d02f95d-a7d1-4df4-9f3f-61531fb0daa0', 18, 26, ARRAY['female'], ARRAY['Long-term relationship', 'Campus coffee & study dates'], true, false, now())
   ON CONFLICT (user_id) DO UPDATE SET
     allow_cross_campus = true,
     same_campus_only = false,
     preferred_genders = ARRAY['female'],
     updated_at = now()`
);

console.log("Dating seed complete!");
await client.end();
