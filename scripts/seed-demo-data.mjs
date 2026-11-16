/**
 * Synthetic Demo Dataset Seeder for Campus Chemistry
 *
 * Requirements from CODEX MASTER PROMPT Section 5:
 * 1. Safe guard against running in production without explicit override (FORCE_DEV_SEED=true).
 * 2. 72 realistic fictional IIT/NIT demo student profiles across 18 canonical IITs & NITs.
 * 3. Verified profiles with authentic names, usernames, study years (1 to 7), stable DiceBear avatars, and bios.
 * 4. ~180 realistic posts spanning tech, photography, club jams, hostel life, mess banter, and hackathons.
 * 5. Full engagement records: post_likes, comments (with threaded replies), follows, bookmarks, events, and event attendees.
 * 6. Repeatable & Idempotent using fixed UUID namespaces and ON CONFLICT upserting.
 * 7. High-performance batching: executes in seconds over network connections.
 */

import process from "node:process";
import pg from "pg";

// 1. Production safety check
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";
const forceDevSeed = process.env.FORCE_DEV_SEED === "true";

if (isProduction && !forceDevSeed) {
  console.error(
    "⛔ [seed-demo-data] Aborted: Refusing to seed synthetic demo data in production without FORCE_DEV_SEED=true."
  );
  process.exit(1);
}

const databaseUrl = process.env.CAMPUS_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("⛔ [seed-demo-data] Error: CAMPUS_DATABASE_URL or DATABASE_URL is required.");
  process.exit(1);
}

// Fixed UUID generator helper
const uuid = (prefix, num) => `${prefix}-0000-0000-0004-${String(num).padStart(12, "0")}`;

// Target canonical institutes specification (10 IITs + 8 NITs = 18 institutes)
const TARGET_INSTITUTES = [
  { key: "iit_bhu", match: /BHU Varanasi/i, fest: "Kashi Yatra", venue: "ADV Grounds" },
  { key: "iit_bombay", match: /Bombay/i, fest: "Mood Indigo", venue: "Gymkhana Grounds" },
  { key: "iit_delhi", match: /Delhi/i, fest: "Rendezvous", venue: "Open Air Theatre (OAT)" },
  { key: "iit_madras", match: /Madras/i, fest: "Saarang", venue: "SAC Amphitheatre" },
  { key: "iit_kanpur", match: /Kanpur/i, fest: "Antaragni", venue: "Main Auditorium Lawn" },
  { key: "iit_kharagpur", match: /Kharagpur/i, fest: "Spring Fest", venue: "Vikramshila Complex" },
  { key: "iit_hyderabad", match: /Hyderabad/i, fest: "Elan & \u03b7Vision", venue: "Academic Block B" },
  { key: "iit_roorkee", match: /Roorkee/i, fest: "Thomso", venue: "Ravindra Bhavan Grounds" },
  { key: "iit_guwahati", match: /Guwahati/i, fest: "Alcheringa", venue: "Dr. Bhupen Hazarika Auditorium" },
  { key: "iit_indore", match: /Indore/i, fest: "Fluxus", venue: "Central Workshop Arena" },
  { key: "nit_trichy", match: /Trichy|Tiruchirappalli/i, fest: "Festember", venue: "Barn Hall & OAT" },
  { key: "nit_warangal", match: /Warangal/i, fest: "SpringSpree", venue: "Auditorium Lawns" },
  { key: "nit_surathkal", match: /Surathkal/i, fest: "Incident", venue: "NITK Beach Stage" },
  { key: "nit_rourkela", match: /Rourkela/i, fest: "Innovision", venue: "BBA Auditorium" },
  { key: "nit_calicut", match: /Calicut/i, fest: "Ragam", venue: "Open Air Stage" },
  { key: "nit_durgapur", match: /Durgapur/i, fest: "Aarohan", venue: "Main Auditorium" },
  { key: "nit_silchar", match: /Silchar/i, fest: "Tecnoesis", venue: "Gymkhana Grounds" },
  { key: "nit_jaipur", match: /Jaipur/i, fest: "Blitzschlag", venue: "Central Lawn" },
];

// 72 authentic student profile definitions (4 per institute)
const STUDENT_TEMPLATES = [
  // 1. IIT BHU Varanasi
  {
    name: "Aryan Sharma",
    username: "aryan_s",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "CSE '27. Distributed systems and compiler design. Chai at Lanka, evening walks by Assi Ghat.",
    avatar: "aryan_sharma",
    interests: ["Coding", "Technology", "Coffee", "Books"],
  },
  {
    name: "Sneha Patel",
    username: "sneha_p",
    dept: "Electronics Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "ECE sophomore. Embedded systems, robotics, and classical Hindustani vocals. Badminton at Gymkhana.",
    avatar: "sneha_patel",
    interests: ["Music", "Coding", "Sports", "Art"],
  },
  {
    name: "Rohan Kulkarni",
    username: "rohan_k",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Mech final year. Formula Student aerodynamics team. Avid photographer catching Varanasi dawns.",
    avatar: "rohan_kulkarni",
    interests: ["Photography", "Travel", "Startups", "Sports"],
  },
  {
    name: "Ananya Iyer",
    username: "ananya_i",
    dept: "Ceramic Engineering & Materials",
    degree: "Dual Degree",
    year: 5,
    bio: "Ceramics + Materials research scholar. Stargazing, indie cinema, and late-night library marathons.",
    avatar: "ananya_iyer",
    interests: ["Research", "Movies", "Books", "Coffee"],
  },

  // 2. IIT Bombay
  {
    name: "Tanmay Roy",
    username: "tanmay_r",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Hostel 16 resident. Web3 and OS internals. Mood Indigo tech lead. Filter coffee addict.",
    avatar: "tanmay_roy",
    interests: ["Coding", "Technology", "Startups", "Coffee"],
  },
  {
    name: "Priya Nair",
    username: "priya_n",
    dept: "Electrical Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "EE '26. Signal processing & neuromorphic computing. Runner around Powai Lake at 6 AM.",
    avatar: "priya_nair",
    interests: ["Running", "Research", "Fitness", "Music"],
  },
  {
    name: "Kabir Verma",
    username: "kabir_v",
    dept: "Aerospace Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Aero second year. Drone autonomy and rocket propulsion. Guitarist in the hostel band.",
    avatar: "kabir_verma",
    interests: ["Music", "Technology", "Gaming", "Sports"],
  },
  {
    name: "Diya Deshmukh",
    username: "diya_d",
    dept: "Design & Interaction",
    degree: "M.Tech",
    year: 6,
    bio: "IDC School of Design. Exploring generative aesthetics, typography, and Mumbai street art.",
    avatar: "diya_deshmukh",
    interests: ["Art", "Photography", "Travel", "Books"],
  },

  // 3. IIT Delhi
  {
    name: "Arjun Singhania",
    username: "arjun_s",
    dept: "Mathematics & Computing",
    degree: "B.Tech",
    year: 3,
    bio: "MnC '27. Quantitative finance, algorithmic game theory, and competitive programming. Nilgiri hostel.",
    avatar: "arjun_singh",
    interests: ["Coding", "Startups", "Coffee", "Gaming"],
  },
  {
    name: "Meera Sen",
    username: "meera_s",
    dept: "Biochemical Engineering & Biotechnology",
    degree: "B.Tech",
    year: 4,
    bio: "Biotech senior. Synthetic biology and CRISPR tools. Literary society convener. Chai enthusiast.",
    avatar: "meera_sen",
    interests: ["Books", "Research", "Coffee", "Art"],
  },
  {
    name: "Devansh Bhardwaj",
    username: "devansh_b",
    dept: "Civil Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Civil sophomore. Urban planning & smart transit models. Street play actor in Rendezvous dramatics.",
    avatar: "devansh_b",
    interests: ["Movies", "Travel", "Music", "Fitness"],
  },
  {
    name: "Natasha Kapoor",
    username: "natasha_k",
    dept: "Computer Science & Engineering",
    degree: "PhD",
    year: 7,
    bio: "PhD researcher in AI security and differential privacy. Mentoring open source contributors.",
    avatar: "natasha_kapoor",
    interests: ["Research", "Technology", "Coding", "Running"],
  },

  // 4. IIT Madras
  {
    name: "Karthik Subramanian",
    username: "karthik_s",
    dept: "Electrical Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "EE '26, Narmada Hostel. VLSI architecture and FPGA hacking. Shaastra tech team lead.",
    avatar: "karthik_sub",
    interests: ["Coding", "Technology", "Gaming", "Coffee"],
  },
  {
    name: "Rhea Menon",
    username: "rhea_m",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "CSE junior. Deep learning for medical imaging. Cycling past blackbucks on campus paths.",
    avatar: "rhea_menon",
    interests: ["Technology", "Fitness", "Research", "Books"],
  },
  {
    name: "Abhinav Raman",
    username: "abhinav_r",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 1,
    bio: "Mech fresher, Alakananda. Formula racing enthusiast. Exploring campus deer sightings and SAC jams.",
    avatar: "abhinav_raman",
    interests: ["Sports", "Music", "Travel", "Coding"],
  },
  {
    name: "Samyuktha Krishnan",
    username: "samyuktha_k",
    dept: "Ocean Engineering",
    degree: "Dual Degree",
    year: 5,
    bio: "Ocean wave energy systems. Carnatic violinist, swimmer, and passionate beach cleaner.",
    avatar: "samyuktha_k",
    interests: ["Music", "Research", "Outdoors", "Running"],
  },

  // 5. IIT Kanpur
  {
    name: "Vikramaditya Joshi",
    username: "vikram_j",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Hall 2 resident. Operating systems & security fuzzing. Antaragni lead coordinator. Nescafe bench regular.",
    avatar: "vikram_joshi",
    interests: ["Coding", "Technology", "Coffee", "Startups"],
  },
  {
    name: "Aditi Mathur",
    username: "aditi_m",
    dept: "Chemical Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "ChemE '27. Battery chemistry and renewable energy storage. Debater, amateur baker.",
    avatar: "aditi_mathur",
    interests: ["Books", "Research", "Coffee", "Art"],
  },
  {
    name: "Saurabh Pandey",
    username: "saurabh_p",
    dept: "Aerospace Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Aero sophomore. Building RC planes at the campus airstrip. Table tennis fanatic.",
    avatar: "saurabh_pandey",
    interests: ["Sports", "Technology", "Travel", "Gaming"],
  },
  {
    name: "Kritika Chawla",
    username: "kritika_c",
    dept: "Materials Science & Engineering",
    degree: "M.Tech",
    year: 5,
    bio: "M.Tech Materials. Nanomaterials for supercapacitors. Classical dancer and campus sketch artist.",
    avatar: "kritika_chawla",
    interests: ["Dance", "Art", "Research", "Music"],
  },

  // 6. IIT Kharagpur
  {
    name: "Sourav Ganguly",
    username: "sourav_g",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Nehru Hall resident. Distributed databases and Rust lover. 2.2 cycle racing veteran.",
    avatar: "sourav_ganguly",
    interests: ["Coding", "Technology", "Sports", "Startups"],
  },
  {
    name: "Ishita Mukherjee",
    username: "ishita_m",
    dept: "Electronics & Electrical Communication",
    degree: "B.Tech",
    year: 4,
    bio: "E&ECE senior, SN/IG Hall. Computer vision and robotics. Spring Fest core team member.",
    avatar: "ishita_mukherjee",
    interests: ["Technology", "Music", "Photography", "Books"],
  },
  {
    name: "Debayan Das",
    username: "debayan_d",
    dept: "Industrial & Systems Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Industrial engineering. Supply chain optimization & poker enthusiast. Late night Tikka point chai.",
    avatar: "debayan_das",
    interests: ["Startups", "Gaming", "Coffee", "Travel"],
  },
  {
    name: "Trisha Bhattacharya",
    username: "trisha_b",
    dept: "Mining Engineering & Geology",
    degree: "Dual Degree",
    year: 5,
    bio: "Dual degree scholar. Remote sensing & geological GIS mapping. Nature trekker and bibliophile.",
    avatar: "trisha_bhatt",
    interests: ["Books", "Travel", "Research", "Photography"],
  },

  // 7. IIT Hyderabad
  {
    name: "Tarun Reddy",
    username: "tarun_r",
    dept: "Artificial Intelligence",
    degree: "B.Tech",
    year: 3,
    bio: "B.Tech AI '27. Large language models and multimodal learning. Hostelite passionate about Hyderabadi biryani.",
    avatar: "tarun_reddy",
    interests: ["Coding", "Technology", "Research", "Gaming"],
  },
  {
    name: "Manasa Varma",
    username: "manasa_v",
    dept: "Electrical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "EE sophomore. Semiconductor fabrication and IoT devices. Basketball point guard.",
    avatar: "manasa_varma",
    interests: ["Sports", "Technology", "Fitness", "Music"],
  },
  {
    name: "Nikhil Chowdary",
    username: "nikhil_c",
    dept: "Mechanical & Aerospace Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Mech senior. Autonomous EV powertrains. Guitarist for campus band Neon Pulse.",
    avatar: "nikhil_chowdary",
    interests: ["Music", "Startups", "Sports", "Travel"],
  },
  {
    name: "Harini Balaji",
    username: "harini_b",
    dept: "Biomedical Engineering",
    degree: "PhD",
    year: 6,
    bio: "PhD in BioMEMS and microfluidics. Science communicator, coffee lover, and weekend birdwatcher.",
    avatar: "harini_balaji",
    interests: ["Research", "Coffee", "Books", "Photography"],
  },

  // 8. IIT Roorkee
  {
    name: "Akshat Saxena",
    username: "akshat_s",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Cautley Hall resident. Cloud infrastructure, Kubernetes, and open-source tooling. Thomso organizer.",
    avatar: "akshat_saxena",
    interests: ["Coding", "Technology", "Startups", "Coffee"],
  },
  {
    name: "Shreya Agarwal",
    username: "shreya_a",
    dept: "Architecture & Planning",
    degree: "B.Arch",
    year: 3,
    bio: "Arch '27. Sustainable urban housing and heritage preservation. Watercolor sketching across campus.",
    avatar: "shreya_agarwal",
    interests: ["Art", "Photography", "Books", "Travel"],
  },
  {
    name: "Harshit Tyagi",
    username: "harshit_t",
    dept: "Civil Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Civil engineering. Earthquake resilient structures. River rafting enthusiast in nearby Rishikesh.",
    avatar: "harshit_tyagi",
    interests: ["Travel", "Sports", "Fitness", "Music"],
  },
  {
    name: "Pallavi Rawat",
    username: "pallavi_r",
    dept: "Chemical Engineering",
    degree: "Dual Degree",
    year: 5,
    bio: "Green polymers & microplastics remediation. Himalayan trekking club leader and avid reader.",
    avatar: "pallavi_rawat",
    interests: ["Research", "Travel", "Books", "Running"],
  },

  // 9. IIT Guwahati
  {
    name: "Bikramjit Bora",
    username: "bikram_b",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Kameng hostel. Machine learning on graphs. Sunset photography overlooking the Brahmaputra.",
    avatar: "bikram_bora",
    interests: ["Photography", "Coding", "Technology", "Music"],
  },
  {
    name: "Deepika Sharma",
    username: "deepika_s",
    dept: "Design (DoD)",
    degree: "B.Des",
    year: 4,
    bio: "Design final year. UI/UX, game design, and digital typography. Alcheringa stage decor head.",
    avatar: "deepika_sharma",
    interests: ["Art", "Gaming", "Movies", "Travel"],
  },
  {
    name: "Gaurav Barman",
    username: "gaurav_b",
    dept: "Biosciences & Bioengineering",
    degree: "B.Tech",
    year: 2,
    bio: "Biotech sophomore. Bioinformatics pipelines & drug discovery. Marathon runner around Serpentine Lake.",
    avatar: "gaurav_barman",
    interests: ["Running", "Research", "Fitness", "Coffee"],
  },
  {
    name: "Rinchen Doma",
    username: "rinchen_d",
    dept: "Mechanical Engineering",
    degree: "M.Tech",
    year: 5,
    bio: "Thermal fluid dynamics scholar. Mountain biking, indie rock, and spicy Assamese cuisine.",
    avatar: "rinchen_doma",
    interests: ["Sports", "Music", "Food", "Books"],
  },

  // 10. IIT Indore
  {
    name: "Yashvardhan Jain",
    username: "yash_j",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "CSE junior. Backend distributed architectures in Go. Sarafa night food bazaar explorer.",
    avatar: "yash_jain",
    interests: ["Coding", "Technology", "Food", "Startups"],
  },
  {
    name: "Simran Bhatia",
    username: "simran_b",
    dept: "Electrical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "EE sophomore. Power electronics and solar grid integration. Vocalist in the cultural club.",
    avatar: "simran_bhatia",
    interests: ["Music", "Technology", "Art", "Coffee"],
  },
  {
    name: "Pranav Dixit",
    username: "pranav_d",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Mech senior. BAJA all-terrain vehicle chassis designer. Inter-college football team captain.",
    avatar: "pranav_dixit",
    interests: ["Sports", "Fitness", "Startups", "Travel"],
  },
  {
    name: "Nandini Vyas",
    username: "nandini_v",
    dept: "Metallurgy Engineering",
    degree: "PhD",
    year: 6,
    bio: "PhD researcher in lightweight high-entropy alloys for aerospace. Astrophotography enthusiast.",
    avatar: "nandini_vyas",
    interests: ["Research", "Photography", "Books", "Coffee"],
  },

  // 11. NIT Trichy
  {
    name: "Saravanan Murugan",
    username: "saravanan_m",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Garnet hostel. Fullstack hacker & open source advocate. Pragyan tech team. Filter kaapi connoisseur.",
    avatar: "saravanan_m",
    interests: ["Coding", "Technology", "Coffee", "Books"],
  },
  {
    name: "Kavya Natarajan",
    username: "kavya_n",
    dept: "Electronics & Communication Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "ECE senior, Opal hostel. Wireless sensor networks. Festember choreo team dancer.",
    avatar: "kavya_natarajan",
    interests: ["Dance", "Music", "Technology", "Fitness"],
  },
  {
    name: "Dinesh Kumar",
    username: "dinesh_k",
    dept: "Production Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Prod sophomore. Smart manufacturing and 3D printing. Cricket spinner in inter-hostel league.",
    avatar: "dinesh_kumar",
    interests: ["Sports", "Technology", "Travel", "Gaming"],
  },
  {
    name: "Swetha Sundaram",
    username: "swetha_s",
    dept: "Instrumentation & Control",
    degree: "M.Tech",
    year: 5,
    bio: "ICE scholar. Industrial automation and cyber-physical systems. Carnatic classical music vocalist.",
    avatar: "swetha_sundaram",
    interests: ["Music", "Research", "Books", "Art"],
  },

  // 12. NIT Warangal
  {
    name: "Venkata Sai Teja",
    username: "sai_teja",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "1.8K hostel resident. Competitive programmer, Codeforces candidate master. SpringSpree organizer.",
    avatar: "sai_teja",
    interests: ["Coding", "Technology", "Gaming", "Coffee"],
  },
  {
    name: "Keerthi Reddy",
    username: "keerthi_r",
    dept: "Civil Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Civil '26. Geotechnical slope stability modeling. Literary club editor and badminton player.",
    avatar: "keerthi_reddy",
    interests: ["Books", "Sports", "Research", "Writing"],
  },
  {
    name: "Manoj Kumar",
    username: "manoj_k",
    dept: "Electrical & Electronics Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "EEE sophomore. Electric vehicle motor controls and drone mapping. Chai at the campus gate.",
    avatar: "manoj_kumar",
    interests: ["Technology", "Startups", "Sports", "Travel"],
  },
  {
    name: "Sravani Vani",
    username: "sravani_v",
    dept: "Biotechnology",
    degree: "Dual Degree",
    year: 5,
    bio: "Biotech dual degree. Bioprocess engineering and microalgal biofuels. Classical Kuchipudi dancer.",
    avatar: "sravani_vani",
    interests: ["Dance", "Research", "Art", "Books"],
  },

  // 13. NIT Surathkal
  {
    name: "Chirag Hegde",
    username: "chirag_h",
    dept: "Information Technology",
    degree: "B.Tech",
    year: 3,
    bio: "Mega Tower hostel. Cloud security & distributed systems. Sunset surfing and beach running.",
    avatar: "chirag_hegde",
    interests: ["Coding", "Technology", "Sports", "Fitness"],
  },
  {
    name: "Aparna Kamath",
    username: "aparna_k",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "CSE senior. Incident convener. NLP research on Indic languages. Sea breeze and coconut water.",
    avatar: "aparna_kamath",
    interests: ["Technology", "Books", "Travel", "Music"],
  },
  {
    name: "Varun Shetty",
    username: "varun_s",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Mech sophomore. Marine propulsion systems & CAD modelling. Weekend beach volleyball setter.",
    avatar: "varun_shetty",
    interests: ["Sports", "Fitness", "Travel", "Photography"],
  },
  {
    name: "Pooja Bhat",
    username: "pooja_b",
    dept: "Mining Engineering",
    degree: "M.Tech",
    year: 5,
    bio: "Rock mechanics and underground excavation stability. Coastal landscape photography enthusiast.",
    avatar: "pooja_bhat",
    interests: ["Photography", "Research", "Books", "Travel"],
  },

  // 14. NIT Rourkela
  {
    name: "Biswajit Mohapatra",
    username: "biswajit_m",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Hall 8 resident. Machine learning and game engine development in C++. Innovision tech lead.",
    avatar: "biswajit_m",
    interests: ["Coding", "Gaming", "Technology", "Startups"],
  },
  {
    name: "Lipika Sahoo",
    username: "lipika_s",
    dept: "Chemical Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "ChemE senior. Carbon capture technologies. Odissi dancer and campus debater.",
    avatar: "lipika_sahoo",
    interests: ["Dance", "Research", "Books", "Coffee"],
  },
  {
    name: "Ashutosh Rout",
    username: "ashutosh_r",
    dept: "Metallurgical & Materials Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Met & Mat sophomore. Steel alloy characterization. Football goalkeeper in inter-NIT league.",
    avatar: "ashutosh_rout",
    interests: ["Sports", "Fitness", "Movies", "Travel"],
  },
  {
    name: "Subhashree Jena",
    username: "subhashree_j",
    dept: "Food Process Engineering",
    degree: "PhD",
    year: 6,
    bio: "Food rheology and shelf-life preservation scholar. Avid botanist maintaining hostel greenhouse plants.",
    avatar: "subhashree_jena",
    interests: ["Research", "Books", "Art", "Travel"],
  },

  // 15. NIT Calicut
  {
    name: "Fahad Rahman",
    username: "fahad_r",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Mega Hostel resident. Linux kernel hacker, cybersecurity CTF player. Ragam music fest organizer.",
    avatar: "fahad_rahman",
    interests: ["Coding", "Technology", "Music", "Coffee"],
  },
  {
    name: "Anjali Pillai",
    username: "anjali_p",
    dept: "Civil Engineering",
    degree: "B.Tech",
    year: 4,
    bio: "Civil senior. Sustainable water resource management. Mohiniyattam dancer and film society lead.",
    avatar: "anjali_pillai",
    interests: ["Dance", "Movies", "Research", "Travel"],
  },
  {
    name: "Gokul Krishna",
    username: "gokul_k",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Mech sophomore. Electric vehicle battery pack cooling. Passionate football fan & Kozhikode food buff.",
    avatar: "gokul_krishna",
    interests: ["Sports", "Food", "Travel", "Technology"],
  },
  {
    name: "Nandana Warrier",
    username: "nandana_w",
    dept: "Architecture & Planning",
    degree: "B.Arch",
    year: 5,
    bio: "B.Arch final year. Tropical vernacular architecture. Hand-drawn urban sketching and espresso lover.",
    avatar: "nandana_warrier",
    interests: ["Art", "Photography", "Coffee", "Books"],
  },

  // 16. NIT Durgapur
  {
    name: "Subham Banerjee",
    username: "subham_b",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Hall 11 resident. Fullstack web dev, microservices, and GraphQL. Aarohan web team head.",
    avatar: "subham_banerjee",
    interests: ["Coding", "Technology", "Music", "Startups"],
  },
  {
    name: "Sreyashi Ghosh",
    username: "sreyashi_g",
    dept: "Biotechnology",
    degree: "B.Tech",
    year: 4,
    bio: "Biotech senior. Industrial enzyme kinetics and protein crystallography. Rabindra Sangeet singer.",
    avatar: "sreyashi_ghosh",
    interests: ["Music", "Research", "Books", "Art"],
  },
  {
    name: "Aritra Sen",
    username: "aritra_s",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Mech sophomore. Robotics manipulator kinematics. Table tennis champion and quizzer.",
    avatar: "aritra_sen",
    interests: ["Gaming", "Sports", "Technology", "Books"],
  },
  {
    name: "Rituparna Roy",
    username: "rituparna_r",
    dept: "Chemical Engineering",
    degree: "M.Tech",
    year: 5,
    bio: "Fluid catalytic cracking scholar. Wildlife photography in Bengal forests & classical literature lover.",
    avatar: "rituparna_roy",
    interests: ["Photography", "Books", "Travel", "Research"],
  },

  // 17. NIT Silchar
  {
    name: "Debojyoti Paul",
    username: "debojyoti_p",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Hostel 9 resident. Distributed streaming pipelines in Apache Kafka. Barak Valley tea connoisseur.",
    avatar: "debojyoti_paul",
    interests: ["Coding", "Technology", "Coffee", "Music"],
  },
  {
    name: "Monika Das",
    username: "monika_d",
    dept: "Electronics & Instrumentation",
    degree: "B.Tech",
    year: 4,
    bio: "EIE senior. Sensor networks & IoT telemetry. Tecnoesis robotic maze solver coordinator.",
    avatar: "monika_das",
    interests: ["Technology", "Coding", "Sports", "Books"],
  },
  {
    name: "Anupam Singha",
    username: "anupam_s",
    dept: "Civil Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Civil sophomore. Hill road slope stabilization & GIS. Passionate guitarist in campus rock jams.",
    avatar: "anupam_singha",
    interests: ["Music", "Travel", "Sports", "Gaming"],
  },
  {
    name: "Rimi Barbhuiya",
    username: "rimi_b",
    dept: "Electrical Engineering",
    degree: "PhD",
    year: 6,
    bio: "PhD scholar in Microgrid power protection. Nature enthusiast documenting Assam flora.",
    avatar: "rimi_barbhuiya",
    interests: ["Research", "Photography", "Books", "Travel"],
  },

  // 18. MNIT Jaipur
  {
    name: "Kunal Meena",
    username: "kunal_m",
    dept: "Computer Science & Engineering",
    degree: "B.Tech",
    year: 3,
    bio: "Aurobindo hostel. System security, reverse engineering, and low-level code. Blitzschlag web team.",
    avatar: "kunal_meena",
    interests: ["Coding", "Technology", "Gaming", "Startups"],
  },
  {
    name: "Tanvi Shekhawat",
    username: "tanvi_s",
    dept: "Architecture & Planning",
    degree: "B.Arch",
    year: 4,
    bio: "Arch '26. Rajasthani stepwells & passive cooling design. Classical Kathak dancer.",
    avatar: "tanvi_shekhawat",
    interests: ["Art", "Dance", "Photography", "Travel"],
  },
  {
    name: "Mayank Rathore",
    username: "mayank_r",
    dept: "Mechanical Engineering",
    degree: "B.Tech",
    year: 2,
    bio: "Mech sophomore. Solar thermal concentrators & automotive CAD. Basketball point forward.",
    avatar: "mayank_rathore",
    interests: ["Sports", "Fitness", "Technology", "Movies"],
  },
  {
    name: "Divya Choudhary",
    username: "divya_c",
    dept: "Chemical Engineering",
    degree: "Dual Degree",
    year: 5,
    bio: "Desalination membrane synthesis researcher. Avid reader, sunset watcher from Nahargarh.",
    avatar: "divya_choudhary",
    interests: ["Research", "Books", "Coffee", "Travel"],
  },
];

// Rich post template generators
const POST_TOPICS = [
  (author, inst) => ({
    body: `Our team just deployed an automated timetable sync & exam calendar tool for all campus residents! Built with Next.js and Postgres over 48 sleepless hours. Check out the open-source repo on GitHub and let us know what features you want next! 🚀💻\n\n#CampusDev #Hackathon #OpenSource #${inst.short_name.replace(/\s+/g, "")}`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Qualified for the ICPC Amritapuri Regionals after a nail-biting online preliminary round! 5 hours, 8 problems, and 12 liters of cold coffee. Huge kudos to my team. Next stop: Regionals on-site! 🏆👨‍💻`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Finally fixed that distributed consensus timeout issue in our lab cluster. Turned out the heartbeat was configured in milliseconds instead of seconds. Coffee was harmed in the making of this patch. ☕🐛`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Our robotics society chassis team finished fabrication for the national RoboWars competition! 45kg dual-motor combat bot with active pneumatic flipper. Testing begins tonight at the workshop arena! 🤖⚡`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Open-sourcing our campus lost-and-found portal today. Every semester dozens of ID cards, calculators, and water bottles get left behind in lecture halls. PRs and bug reports welcome! Link in bio. 📦✨`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Golden hour over the main academic building today. With end-sems just around the corner, this peaceful moment was exactly what I needed. Forever grateful for this campus. 🌅📸`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `The morning mist over the campus grounds during an 8 AM walk. The temperature dropped to 14°C today. Crisp winter mornings in college are unmatched! ❄️🍃`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Campus peacocks decided to stroll right through the verandah during our fluid mechanics tutorial today. Hands down the highest attendance we've had all semester. 🦚📚`,
    audience: "followers",
  }),
  (author, inst) => ({
    body: `Midnight walk after finishing an assignment deadline. The campus library under the starry sky looks magical. Don't forget to take a breather, folks! 🌌✨`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `The Music Society is hosting an Acoustic Jam & Open Mic this Friday evening at the ${inst.venue}! Bring your acoustic guitars, cajons, flutes, or just your singing voice. No auditions required, just pure music and good vibes. 🎸🎤🎶`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Astronomy Club Stargazing Night tonight from 9:30 PM onwards at the sports grounds! The sky is completely clear, and both Jupiter's moons and Saturn's rings will be sharp through the 8-inch Dobsonian telescope. Hot chai provided! 🔭🪐`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Dramatics Society street play rehearsals are in full swing for ${inst.fest}! If you want to join the backstage crew, sound team, or costume design, drop by the amphitheater today at 5:30 PM. 🎭🎪`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Debating Society auditions for the inter-varsity parliamentary debate tournament start tomorrow! Topics range from technological ethics to geopolitical shifts. Registration link in bio. 🗣️⚖️`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Nothing unites an entire hostel corridor faster than the aroma of 2 AM Maggi being cooked with oregano and extra cheese in room 214. True brotherhood right here. 🍜🧀`,
    audience: "followers",
  }),
  (author, inst) => ({
    body: `Third time this month someone 'borrowed' my cycle from the LHC stand without asking. If you took the dark blue Hero cycle with neon stickers, please park it back outside Hostel 4! 🚲😅`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Mess committee update: After three rounds of democratic voting and petitioning, paneer butter masala is officially approved for 3 dinners a week starting this Monday! Democracy wins. 🍛✨`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Hostel power outage right in the middle of the last over of the cricket match caused a collective scream from all 4 hostel blocks that probably registered on local seismographs. 🏏⚡`,
    audience: "followers",
  }),
  (author, inst) => ({
    body: `Surviving on Nescafe black coffee and 4 hours of sleep. The midsem syllabus is infinite, but human determination (and caffeine) knows no bounds. We ride at dawn! ☕📖`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Inter-hostel floodlit football finals tonight at 8 PM! Hostel 3 vs Hostel 7. Both teams are unbeaten this season. Come through and support your wings! ⚽🔥`,
    audience: "campus",
  }),
  (author, inst) => ({
    body: `Completed an early morning 10K run around the campus perimeter. Fresh morning breeze, quiet roads, and post-run South Indian tiffin. Best way to start a Saturday! 🏃‍♂️👟`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Badminton court slots opened at 7:00:00 AM. By 7:00:03 AM all slots were booked. Faster than booking Tatkal train tickets honestly! 🏸⚡`,
    audience: "followers",
  }),
  (author, inst) => ({
    body: `First research paper officially accepted at IEEE Transactions! Countless late nights running simulations, re-evaluating benchmarks, and revising drafts with my guide. Grateful to everyone who supported this journey! 📄🎓✨`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Professor in class: 'Midsem exam will be straightforward and testing only basic concepts.'\n\nThe midsem exam: 'Calculate the entropy change of a relativistic cat traversing a non-Euclidean quantum foam.' 🐱📐💀`,
    audience: "public",
  }),
  (author, inst) => ({
    body: `Finally synthesized the nanocrystalline catalyst sample after four failed autoclave runs! Patience is indeed a virtue in materials chemistry. Onto XRD and SEM imaging tomorrow! 🔬🧪`,
    audience: "public",
  }),
];

const COMMENT_TEMPLATES = [
  "Huge congratulations! Very well deserved 🎉👏",
  "Drop the GitHub repository link please! Would love to contribute.",
  "Mess paneer update is the biggest win of the entire semester honestly 🙌🍛",
  "Count me in for the jam session! I can bring my acoustic guitar 🎸",
  "Check near the chemical engineering cycle stand, saw a blue cycle parked there earlier today!",
  "Stargazing at what time exactly? Hope the sky stays clear tonight! 🔭",
  "All the best for ICPC regionals! Make the campus proud 🏆",
  "Which research lab was this? Dr. Rao's team? Phenomenal work!",
  "Haha the cat question is so accurate it hurts 😂😭",
  "10K in this weather is impressive! What's your pace?",
  "Will the street play be performed in Hindi or English?",
  "Hostel corridor Maggi is an emotion that textbooks will never capture.",
  "Can alumni attend the cultural night? Would love to visit campus!",
  "This photo looks straight out of an architecture magazine! Great framing 📸",
  "That flipper torque looks insane. Which motor are you guys driving it with?",
  "Best of luck for the finals tonight! May the best hostel win ⚽",
  "Where can we find the rulebook for the hackathon?",
  "Caffeine and determination: the official fuel of engineering students.",
  "Bro that problem set was genuinely brutal, glad we made it through together.",
  "Awesome initiative with the lost-and-found portal! Much needed on campus.",
];

const EVENT_SPECS = [
  {
    title: "Kashi Yatra 2026: Eastern Cultural Panorama",
    category: "Cultural Fest",
    desc: "The annual youth extravaganza of IIT (BHU) Varanasi featuring band battles, classical fusion, pro-nights, and literary debates on the historic banks of the Ganges.",
    capacity: 2500,
    venue: "ADV Grounds & Amphitheatre",
    vis: "inter_campus",
    daysAhead: 14,
    durationHours: 72,
  },
  {
    title: "Techfest 2026: AI for Bharat Hackathon",
    category: "Tech & Hackathon",
    desc: "36-hour flagship hackathon at IIT Bombay challenging student teams to build high-impact AI, robotics, and climate-tech solutions. Cash prizes, mentor sessions, and incubation offers.",
    capacity: 1200,
    venue: "Gymkhana Grounds & LHC Complex",
    vis: "inter_campus",
    daysAhead: 21,
    durationHours: 36,
  },
  {
    title: "Rendezvous Acoustic Sunset Jam",
    category: "Music & Jamming",
    desc: "An unplugged musical evening hosted by the IIT Delhi Music Club. Students, hostel bands, and solo vocalists perform acoustic covers and original songwriting as the sun sets over the OAT.",
    capacity: 800,
    venue: "Open Air Theatre (OAT)",
    vis: "campus",
    daysAhead: 7,
    durationHours: 4,
  },
  {
    title: "Shaastra RoboWars & Aerial Drone Grand Prix",
    category: "Robotics & Hardware",
    desc: "IIT Madras flagship robotics championship. Heavyweight combat robots battle inside a dual-polycarbonate arena alongside autonomous FPV drone racing obstacle courses.",
    capacity: 1500,
    venue: "SAC Amphitheatre & KV Grounds",
    vis: "inter_campus",
    daysAhead: 28,
    durationHours: 48,
  },
  {
    title: "Antaragni Battle of the Bands",
    category: "Cultural Fest",
    desc: "The premier rock and metal showdown at IIT Kanpur. Top collegiate bands from across India compete for the ultimate trophy under stadium lights and roaring crowds.",
    capacity: 3000,
    venue: "Main Auditorium Lawns",
    vis: "inter_campus",
    daysAhead: 35,
    durationHours: 6,
  },
  {
    title: "Kshitij 2026: National Data & AI Summit",
    category: "Tech & Hackathon",
    desc: "IIT Kharagpur's flagship techno-management symposium. Keynotes from industry pioneers, algorithmic trading competitions, and autonomous systems exhibitions.",
    capacity: 2000,
    venue: "Vikramshila Complex",
    vis: "inter_campus",
    daysAhead: 18,
    durationHours: 48,
  },
  {
    title: "Elan & \u03b7Vision GameDev & Design Sprint",
    category: "Tech & Hackathon",
    desc: "A high-octane 24-hour sprint at IIT Hyderabad where developers, UI/UX designers, and sound artists collaborate to produce playable indie games using Unreal Engine and Godot.",
    capacity: 600,
    venue: "Academic Block B Arena",
    vis: "campus",
    daysAhead: 10,
    durationHours: 24,
  },
  {
    title: "Thomso Inter-College Youth Conclave",
    category: "Cultural Fest",
    desc: "IIT Roorkee presents three days of energetic fashion shows, street theatre, EDM nights, and multidisciplinary workshops celebrating youth culture.",
    capacity: 2200,
    venue: "Ravindra Bhavan Grounds",
    vis: "inter_campus",
    daysAhead: 42,
    durationHours: 72,
  },
  {
    title: "Alcheringa Neon Night & EDM Extravaganza",
    category: "Music & Jamming",
    desc: "North-East India's largest festival night at IIT Guwahati. Spectacular laser shows, international DJ lineups, and campus glow-in-the-dark dance parties.",
    capacity: 3500,
    venue: "Dr. Bhupen Hazarika Auditorium",
    vis: "inter_campus",
    daysAhead: 30,
    durationHours: 8,
  },
  {
    title: "Fluxus Autonomous Vehicle Showcase",
    category: "Robotics & Hardware",
    desc: "IIT Indore robotics and mechanical society demo day. Live demonstrations of self-driving electric go-karts, all-terrain buggies, and drone delivery prototypes.",
    capacity: 700,
    venue: "Central Workshop Arena",
    vis: "campus",
    daysAhead: 16,
    durationHours: 6,
  },
  {
    title: "Festember Southern Cultural Gala",
    category: "Cultural Fest",
    desc: "NIT Trichy's marquee cultural festival featuring literary debate clashes, classical arts retrospectives, pro-shows, and culinary carnivals spanning 4 days.",
    capacity: 3000,
    venue: "Barn Hall & Open Air Theatre",
    vis: "inter_campus",
    daysAhead: 25,
    durationHours: 72,
  },
  {
    title: "SpringSpree Inter-Hostel Dance Championship",
    category: "Cultural Fest",
    desc: "High-intensity western and folk dance crew battles between hostel blocks and invited teams at NIT Warangal's majestic open stage.",
    capacity: 1800,
    venue: "Auditorium Lawns",
    vis: "campus",
    daysAhead: 12,
    durationHours: 5,
  },
  {
    title: "Incident 2026: Beachside Music Odyssey",
    category: "Music & Jamming",
    desc: "NIT Surathkal's iconic beach festival with acoustic stages right on the shores of the Arabian Sea, sunset beach volleyball, and live fusion bands.",
    capacity: 2500,
    venue: "NITK Beach Stage & Lighthouse Lawn",
    vis: "inter_campus",
    daysAhead: 32,
    durationHours: 48,
  },
  {
    title: "Innovision Open Source Hackathon",
    category: "Tech & Hackathon",
    desc: "NIT Rourkela's annual open-source sprint. Build tools, contribute to upstream Linux and web frameworks, and win bounties sponsored by tech giants.",
    capacity: 900,
    venue: "BBA Auditorium & CS Department Labs",
    vis: "inter_campus",
    daysAhead: 20,
    durationHours: 36,
  },
  {
    title: "Ragam South India Inter-Varsity Arts Festival",
    category: "Cultural Fest",
    desc: "NIT Calicut's historic celebration of drama, choreography, instrumental fusion, and visual arts attracting talent from across the country.",
    capacity: 3200,
    venue: "Open Air Stage",
    vis: "inter_campus",
    daysAhead: 38,
    durationHours: 72,
  },
  {
    title: "Aarohan Techno-Management Conclave",
    category: "Tech & Hackathon",
    desc: "NIT Durgapur's premier technical exhibition. Circuit design sprints, paper presentations, and business pitch competitions judged by venture capitalists.",
    capacity: 1100,
    venue: "Main Auditorium Complex",
    vis: "inter_campus",
    daysAhead: 15,
    durationHours: 48,
  },
  {
    title: "Tecnoesis Smart India Engineering Showcase",
    category: "Robotics & Hardware",
    desc: "NIT Silchar brings together drone innovators, smart grid researchers, and IoT builders across the north-eastern region for practical demonstrations.",
    capacity: 850,
    venue: "Gymkhana Grounds",
    vis: "campus",
    daysAhead: 22,
    durationHours: 24,
  },
  {
    title: "Blitzschlag Desert Cultural Panorama",
    category: "Cultural Fest",
    desc: "MNIT Jaipur's signature annual youth festival combining royal Rajasthani heritage, modern music nights, fashion runways, and street art graffiti showcases.",
    capacity: 2800,
    venue: "Central Lawn & Open Air Theatre",
    vis: "inter_campus",
    daysAhead: 27,
    durationHours: 72,
  },
];

async function main() {
  console.log("🚀 [seed-demo-data] Starting synthetic demo data seeding...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  client.on("error", (err) => {
    console.error("⚠️ [seed-demo-data] PG client warning:", err.message);
  });

  try {
    await client.connect();
    console.log("✅ [seed-demo-data] Connected to PostgreSQL database.");

    // Ensure notifications table has actor_id column if migration wasn't run
    await client.query(`
      alter table public.notifications
      add column if not exists actor_id uuid references public.profiles(id) on delete set null;
    `);

    // Fetch canonical institutes from database
    const { rows: institutesInDb } = await client.query(`
      select id, short_name, official_name, city, state
      from public.institutes
      where is_active = true
      order by short_name;
    `);

    console.log(`ℹ️ [seed-demo-data] Found ${institutesInDb.length} active institutes in database.`);

    const resolvedInstitutes = [];
    for (const target of TARGET_INSTITUTES) {
      const found = institutesInDb.find(
        (inst) => target.match.test(inst.short_name) || target.match.test(inst.official_name)
      );
      if (!found) {
        throw new Error(`Could not find canonical institute matching pattern: ${target.match}`);
      }
      resolvedInstitutes.push({
        ...target,
        dbId: found.id,
        short_name: found.short_name,
        official_name: found.official_name,
      });
    }

    console.log(`✅ [seed-demo-data] Successfully resolved all 18 canonical target institutes.`);

    // Fetch existing interests for linking profiles
    const { rows: allInterests } = await client.query("select id, name from public.interests;");
    const interestMap = new Map(allInterests.map((row) => [row.name.toLowerCase(), row.id]));

    await client.query("BEGIN;");

    // ==========================================
    // 1. BATCH UPSERT: auth.users & profiles (72)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch upserting 72 demo student profiles...");
    const profiles = [];
    const authValues = [];
    const authParams = [];
    const profileValues = [];
    const profileParams = [];
    const interestRows = [];

    let pIdx = 1;
    for (let i = 0; i < STUDENT_TEMPLATES.length; i++) {
      const template = STUDENT_TEMPLATES[i];
      const instIndex = Math.floor(i / 4);
      const institute = resolvedInstitutes[instIndex];
      const profileId = uuid("10000000", i + 1);
      const email = `demo.student${i + 1}@campuschemistry.internal`;
      const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
        template.avatar
      )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

      // auth.users row: ($1, 'authenticated', 'authenticated', $2, false, false, now(), now(), now(), jsonb_build_object('full_name', $3::text, 'demo_user', true))
      authValues.push(
        `($${i * 3 + 1}, 'authenticated', 'authenticated', $${i * 3 + 2}, false, false, now(), now(), now(), jsonb_build_object('full_name', $${i * 3 + 3}::text, 'demo_user', true))`
      );
      authParams.push(profileId, email, template.name);

      // profiles row
      profileValues.push(
        `($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, 'verified', true, 'public', false, false, true, 'everyone', true, $${pIdx++}, now() - interval '60 days', now(), now() - interval '60 days')`
      );
      profileParams.push(
        profileId,
        template.username,
        template.name,
        institute.dbId,
        template.degree,
        template.dept,
        template.year,
        template.bio,
        avatarUrl
      );

      for (const intName of template.interests) {
        const intId = interestMap.get(intName.toLowerCase());
        if (intId) {
          interestRows.push({ profileId, intId });
        }
      }

      profiles.push({
        id: profileId,
        username: template.username,
        name: template.name,
        instituteId: institute.dbId,
        institute: institute,
        index: i,
      });
    }

    // Execute auth.users batch
    await client.query(
      `
      insert into auth.users (
        id, aud, role, email, is_sso_user, is_anonymous, created_at, updated_at,
        email_confirmed_at, raw_user_meta_data
      )
      values ${authValues.join(", ")}
      on conflict (id) do update set
        email = excluded.email,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = now();
    `,
      authParams
    );

    // Execute profiles batch
    await client.query(
      `
      insert into public.profiles (
        id, username, display_name, institute_id, degree, department, study_year,
        bio, verification_status, current_student, social_visibility, dating_enabled,
        dating_visibility, cross_campus_visibility, message_permission, activity_visibility,
        avatar_url, created_at, updated_at, onboarding_completed_at
      )
      values ${profileValues.join(", ")}
      on conflict (id) do update set
        username = excluded.username,
        display_name = excluded.display_name,
        institute_id = excluded.institute_id,
        degree = excluded.degree,
        department = excluded.department,
        study_year = excluded.study_year,
        bio = excluded.bio,
        verification_status = excluded.verification_status,
        social_visibility = excluded.social_visibility,
        avatar_url = excluded.avatar_url,
        cross_campus_visibility = excluded.cross_campus_visibility,
        message_permission = excluded.message_permission,
        updated_at = now();
    `,
      profileParams
    );

    // Execute user_interests batch
    if (interestRows.length > 0) {
      const intVal = [];
      const intParam = [];
      let iIdx = 1;
      for (const row of interestRows) {
        intVal.push(`($${iIdx++}, $${iIdx++}, now())`);
        intParam.push(row.profileId, row.intId);
      }
      await client.query(
        `
        insert into public.user_interests (user_id, interest_id, created_at)
        values ${intVal.join(", ")}
        on conflict (user_id, interest_id) do nothing;
      `,
        intParam
      );
    }

    console.log(`✅ [seed-demo-data] 72 student profiles successfully seeded.`);

    // ==========================================
    // 2. BATCH UPSERT: Posts (~180)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch upserting 180 realistic posts...");
    const posts = [];
    const postValues = [];
    const postParams = [];
    let postCount = 0;
    let postParamIdx = 1;

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const countForThisUser = i % 2 === 0 ? 3 : 2;

      for (let p = 0; p < countForThisUser; p++) {
        postCount++;
        const postId = uuid("20000000", postCount);
        const topicIdx = (i * 3 + p) % POST_TOPICS.length;
        const topicGenerator = POST_TOPICS[topicIdx];
        const postContent = topicGenerator(profile, profile.institute);

        const daysAgo = ((postCount * 7) % 28) + 1;
        const hoursAgo = (postCount * 3) % 24;

        postValues.push(
          `($${postParamIdx++}, $${postParamIdx++}, $${postParamIdx++}, $${postParamIdx++}, $${postParamIdx++}, now() - ($${postParamIdx++} || ' days')::interval - ($${postParamIdx++} || ' hours')::interval, now() - ($${postParamIdx++} || ' days')::interval - ($${postParamIdx++} || ' hours')::interval)`
        );
        postParams.push(
          postId,
          profile.id,
          profile.instituteId,
          postContent.body,
          postContent.audience,
          daysAgo,
          hoursAgo,
          daysAgo,
          hoursAgo
        );

        posts.push({
          id: postId,
          authorId: profile.id,
          instituteId: profile.instituteId,
          daysAgo,
          index: postCount,
        });
      }
    }

    await client.query(
      `
      insert into public.posts (
        id, author_id, institute_id, body, audience, created_at, updated_at
      )
      values ${postValues.join(", ")}
      on conflict (id) do update set
        body = excluded.body,
        audience = excluded.audience,
        institute_id = excluded.institute_id,
        updated_at = now();
    `,
      postParams
    );

    console.log(`✅ [seed-demo-data] 180 posts successfully seeded.`);

    // ==========================================
    // 3. BATCH UPSERT: Post Likes (~450)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch seeding post likes...");
    const likeValues = [];
    const likeParams = [];
    let likeParamIdx = 1;

    for (let p = 0; p < posts.length; p++) {
      const post = posts[p];
      const numLikes = (p % 5) + 1;
      const eligibleUsers = profiles.filter((prof) => prof.id !== post.authorId);

      for (let l = 0; l < numLikes; l++) {
        const user = eligibleUsers[(p * 3 + l * 7) % eligibleUsers.length];
        likeValues.push(`($${likeParamIdx++}, $${likeParamIdx++}, now() - ($${likeParamIdx++} || ' days')::interval)`);
        likeParams.push(post.id, user.id, post.daysAgo);
      }
    }

    await client.query(
      `
      insert into public.post_likes (post_id, user_id, created_at)
      values ${likeValues.join(", ")}
      on conflict (post_id, user_id) do nothing;
    `,
      likeParams
    );

    console.log(`✅ [seed-demo-data] Post likes created: ~${likeValues.length}`);

    // ==========================================
    // 4. BATCH UPSERT: Comments (~135)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch seeding comments & threaded replies...");
    const commentValues = [];
    const commentParams = [];
    let commentIndex = 0;
    let commentParamIdx = 1;

    // First pass: top-level comments
    const repliesToSeed = [];
    for (let p = 0; p < posts.length && commentIndex < 100; p += 2) {
      const post = posts[p];
      const commentAuthor1 = profiles[(p * 2 + 1) % profiles.length];
      if (commentAuthor1.id === post.authorId) continue;

      commentIndex++;
      const commentId1 = uuid("30000000", commentIndex);
      const text1 = COMMENT_TEMPLATES[(p + 3) % COMMENT_TEMPLATES.length];

      commentValues.push(
        `($${commentParamIdx++}, $${commentParamIdx++}, $${commentParamIdx++}, null, $${commentParamIdx++}, now() - ($${commentParamIdx++} || ' days')::interval + interval '2 hours')`
      );
      commentParams.push(commentId1, post.id, commentAuthor1.id, text1, post.daysAgo);

      if (p % 3 === 0) {
        repliesToSeed.push({ parentId: commentId1, post, p });
      }
    }

    await client.query(
      `
      insert into public.comments (
        id, post_id, author_id, parent_id, body, created_at
      )
      values ${commentValues.join(", ")}
      on conflict (id) do update set
        body = excluded.body;
    `,
      commentParams
    );

    // Second pass: threaded replies
    if (repliesToSeed.length > 0) {
      const replyValues = [];
      const replyParams = [];
      let replyParamIdx = 1;

      for (const rep of repliesToSeed) {
        commentIndex++;
        const replyId = uuid("30000000", commentIndex);
        const replyText =
          rep.p % 2 === 0
            ? "Thanks a lot! Let me know if you want to team up sometime."
            : "Appreciate the feedback! We are rolling out an update this week.";

        replyValues.push(
          `($${replyParamIdx++}, $${replyParamIdx++}, $${replyParamIdx++}, $${replyParamIdx++}, $${replyParamIdx++}, now() - ($${replyParamIdx++} || ' days')::interval + interval '4 hours')`
        );
        replyParams.push(replyId, rep.post.id, rep.post.authorId, rep.parentId, replyText, rep.post.daysAgo);
      }

      await client.query(
        `
        insert into public.comments (
          id, post_id, author_id, parent_id, body, created_at
        )
        values ${replyValues.join(", ")}
        on conflict (id) do update set
          body = excluded.body;
      `,
        replyParams
      );
    }

    console.log(`✅ [seed-demo-data] Comments seeded: ${commentIndex}`);

    // ==========================================
    // 5. BATCH UPSERT: Follows (~216)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch seeding follows network...");
    const followValues = [];
    const followParams = [];
    let followParamIdx = 1;

    for (let i = 0; i < profiles.length; i++) {
      const current = profiles[i];
      const sameCampusUsers = profiles.filter(
        (p) => p.instituteId === current.instituteId && p.id !== current.id
      );
      for (const peer of sameCampusUsers.slice(0, 2)) {
        followValues.push(`($${followParamIdx++}, $${followParamIdx++}, 'accepted', now() - interval '40 days')`);
        followParams.push(current.id, peer.id);
      }

      const crossCampusPeer = profiles[(i * 5 + 3) % profiles.length];
      if (crossCampusPeer.id !== current.id && crossCampusPeer.instituteId !== current.instituteId) {
        followValues.push(`($${followParamIdx++}, $${followParamIdx++}, 'accepted', now() - interval '25 days')`);
        followParams.push(current.id, crossCampusPeer.id);
      }
    }

    await client.query(
      `
      insert into public.follows (follower_id, following_id, status, created_at)
      values ${followValues.join(", ")}
      on conflict (follower_id, following_id) do nothing;
    `,
      followParams
    );

    console.log(`✅ [seed-demo-data] Follows seeded: ~${followValues.length}`);

    // ==========================================
    // 6. BATCH UPSERT: Post Bookmarks (~90)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch seeding post bookmarks...");
    const bookmarkValues = [];
    const bookmarkParams = [];
    let bmParamIdx = 1;

    for (let p = 0; p < posts.length; p += 2) {
      const post = posts[p];
      const bookmarkUser = profiles[(p * 3 + 2) % profiles.length];
      bookmarkValues.push(`($${bmParamIdx++}, $${bmParamIdx++}, now() - ($${bmParamIdx++} || ' days')::interval)`);
      bookmarkParams.push(post.id, bookmarkUser.id, post.daysAgo);
    }

    await client.query(
      `
      insert into public.post_bookmarks (post_id, user_id, created_at)
      values ${bookmarkValues.join(", ")}
      on conflict (post_id, user_id) do nothing;
    `,
      bookmarkParams
    );

    console.log(`✅ [seed-demo-data] Post bookmarks seeded: ~${bookmarkValues.length}`);

    // ==========================================
    // 7. BATCH UPSERT: Events (18) & Attendees (~144)
    // ==========================================
    console.log("📝 [seed-demo-data] Batch seeding 18 campus events & attendees...");
    const eventValues = [];
    const eventParams = [];
    let evParamIdx = 1;
    const events = [];

    for (let e = 0; e < EVENT_SPECS.length; e++) {
      const spec = EVENT_SPECS[e];
      const institute = resolvedInstitutes[e];
      const host = profiles[e * 4];
      const eventId = uuid("40000000", e + 1);

      eventValues.push(
        `($${evParamIdx++}, $${evParamIdx++}, $${evParamIdx++}, $${evParamIdx++}, $${evParamIdx++}, $${evParamIdx++}, now() + ($${evParamIdx++} || ' days')::interval, now() + ($${evParamIdx++} || ' days')::interval + ($${evParamIdx++} || ' hours')::interval, $${evParamIdx++}, $${evParamIdx++}, $${evParamIdx++}, 'published', now() - interval '10 days')`
      );
      eventParams.push(
        eventId,
        host.id,
        institute.dbId,
        spec.title,
        spec.desc,
        spec.category,
        spec.daysAhead,
        spec.daysAhead,
        spec.durationHours,
        spec.venue,
        spec.capacity,
        spec.vis
      );

      events.push({ id: eventId, instituteId: institute.dbId });
    }

    await client.query(
      `
      insert into public.events (
        id, host_id, institute_id, title, description, category,
        starts_at, ends_at, approximate_venue, capacity, visibility, status, created_at
      )
      values ${eventValues.join(", ")}
      on conflict (id) do update set
        title = excluded.title,
        description = excluded.description,
        category = excluded.category,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        approximate_venue = excluded.approximate_venue,
        capacity = excluded.capacity,
        visibility = excluded.visibility,
        status = excluded.status;
    `,
      eventParams
    );

    console.log(`✅ [seed-demo-data] 18 events successfully seeded.`);

    // Event Attendees
    const attendeeValues = [];
    const attendeeParams = [];
    let attParamIdx = 1;

    for (let e = 0; e < events.length; e++) {
      const event = events[e];
      const campusStudents = profiles.filter((p) => p.instituteId === event.instituteId);
      for (const student of campusStudents) {
        attendeeValues.push(`($${attParamIdx++}, $${attParamIdx++}, 'going', now() - interval '5 days')`);
        attendeeParams.push(event.id, student.id);
      }

      for (let s = 1; s <= 4; s++) {
        const guest = profiles[(e * 4 + s * 3) % profiles.length];
        if (guest.instituteId !== event.instituteId) {
          attendeeValues.push(`($${attParamIdx++}, $${attParamIdx++}, 'going', now() - interval '3 days')`);
          attendeeParams.push(event.id, guest.id);
        }
      }
    }

    await client.query(
      `
      insert into public.event_attendees (event_id, user_id, status, created_at)
      values ${attendeeValues.join(", ")}
      on conflict (event_id, user_id) do nothing;
    `,
      attendeeParams
    );

    console.log(`✅ [seed-demo-data] Event attendees seeded: ~${attendeeValues.length}`);

    await client.query("COMMIT;");
    console.log("🎉 [seed-demo-data] Transaction committed successfully!");

    // ==========================================
    // 8. FINAL SUMMARY QUERY
    // ==========================================
    const summaryRes = await client.query(`
      select
        (select count(*)::int from public.profiles where id::text like '10000000-0000-0000-0004-%') as demo_profiles,
        (select count(*)::int from public.posts where id::text like '20000000-0000-0000-0004-%') as demo_posts,
        (select count(*)::int from public.post_likes) as total_likes,
        (select count(*)::int from public.comments where id::text like '30000000-0000-0000-0004-%') as demo_comments,
        (select count(*)::int from public.follows) as total_follows,
        (select count(*)::int from public.post_bookmarks) as total_bookmarks,
        (select count(*)::int from public.events where id::text like '40000000-0000-0000-0004-%') as demo_events,
        (select count(*)::int from public.event_attendees) as total_event_attendees;
    `);

    const summary = summaryRes.rows[0];
    console.log("\n================ DEMO DATASET SEED SUMMARY ================");
    console.log(`🎓 Demo Student Profiles:   ${summary.demo_profiles} (across 18 IITs & NITs)`);
    console.log(`📝 Demo Feed Posts:         ${summary.demo_posts} (tech, photography, clubs, banter)`);
    console.log(`❤️  Post Likes:              ${summary.total_likes}`);
    console.log(`💬 Demo Comments:           ${summary.demo_comments} (including threaded replies)`);
    console.log(`🤝 Follow Connections:      ${summary.total_follows}`);
    console.log(`🔖 Post Bookmarks:          ${summary.total_bookmarks}`);
    console.log(`🎪 Campus Events:           ${summary.demo_events} (fests, hackathons, jams)`);
    console.log(`🎟️  Event Attendees:         ${summary.total_event_attendees}`);
    console.log("===========================================================\n");
  } catch (err) {
    await client.query("ROLLBACK;").catch(() => undefined);
    console.error("❌ [seed-demo-data] Error seeding demo data:", err);
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
