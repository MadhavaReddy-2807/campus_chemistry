export type Community = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  campus_scope: string;
  member_count?: number;
  is_member?: boolean;
};

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: "10000000-0000-0000-0003-000000000001",
    name: "IIT/NIT Hackers & Builders",
    slug: "hackers-and-builders",
    description: "Open collaborative space for software engineers, ML researchers, and open-source contributors across all IITs and NITs.",
    category: "Tech & Coding",
    campus_scope: "All IITs & NITs",
    member_count: 342,
  },
  {
    id: "10000000-0000-0000-0003-000000000002",
    name: "Indie Acoustic & Jamming Room",
    slug: "indie-acoustic-jam",
    description: "For musicians, vocalists, songwriters, and bedroom producers sharing rough takes, finding bandmates, and hosting hostel jam sessions.",
    category: "Music & Jamming",
    campus_scope: "All IITs & NITs",
    member_count: 188,
  },
  {
    id: "10000000-0000-0000-0003-000000000003",
    name: "Campus Photography Collective",
    slug: "photography-collective",
    description: "Golden hour shots around campus, street photography during fests, and gear/technique discussions.",
    category: "Creative & Arts",
    campus_scope: "All IITs & NITs",
    member_count: 215,
  },
  {
    id: "10000000-0000-0000-0003-000000000004",
    name: "Founders & Zero-to-One Circle",
    slug: "founders-circle",
    description: "Peer circle for students building startups, raising angel rounds, or working on early prototypes between exams.",
    category: "Entrepreneurship",
    campus_scope: "All IITs & NITs",
    member_count: 164,
  },
  {
    id: "10000000-0000-0000-0003-000000000005",
    name: "Campus Runners & Sunrise Club",
    slug: "runners-sunrise-club",
    description: "Early morning tracks, 5k/10k training, marathon banter, and accountability partners before morning lectures.",
    category: "Sports & Fitness",
    campus_scope: "All IITs & NITs",
    member_count: 129,
  },
  {
    id: "10000000-0000-0000-0003-000000000006",
    name: "Debate & Philosophy Society",
    slug: "debate-philosophy",
    description: "Nuanced discussions on ethics, tech policy, existential philosophy, and inter-college parliamentary debates.",
    category: "Literature & Debating",
    campus_scope: "All IITs & NITs",
    member_count: 98,
  },
];
