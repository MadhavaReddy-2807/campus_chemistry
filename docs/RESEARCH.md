# Campus Chemistry research

Research date: 2026-11-13

## Product references

| Reference | Useful pattern | Adopted decision | Caution |
|---|---|---|---|
| [Tinder safety](https://tinder.com/safety-tips/) | Verification and safety are core product surfaces | Put verification, block, report, and safe-meetup guidance in primary flows | Do not imply verification guarantees safety |
| [Bumble safety](https://support.bumble.com/hc/en-us/articles/28537051467293-Our-safety-features) | Unmatch, report, review-before-send, and anti-abuse controls | Build block/unmatch/report as first-class domain operations | Moderation needs human review and appeal paths |
| [Hinge prompts](https://help.hinge.co/hc/en-us/articles/36311352171539-How-do-I-edit-my-Prompts) | Prompt answers make personality legible | Allow prompt-specific likes/comments and prompt-based discovery | Keep prompts optional and avoid engagement pressure |
| [Hinge matching/chat](https://help.hinge.co/hc/en-us/articles/360011090134-How-Do-I-Match-with-Someone-and-Start-Chatting) | A like can carry a meaningful comment | Store the target profile item and comment atomically with the like | Comments must respect recipient settings and abuse filters |
| Meetup / Eventbrite / Luma / Partiful | Event creation, RSVP, waitlist, reminders, host controls | Events are a core domain, not a marketing page | Exact private locations stay restricted |

## Open-source references

| Repository | Findings | Reuse policy / license note |
|---|---|---|
| [Clonagram](https://github.com/zivavu/Clonagram) | Next.js + Supabase Instagram-style structure; useful feed/storage/auth boundaries | Inspect license before copying code; use patterns only until license is confirmed in checkout |
| [linkup-dating-app](https://github.com/Itsme23476/linkup-dating-app) | Supabase migrations, RLS, server-side atomic match creation, realtime chat, ranked deck | MIT is stated in README; no direct copy yet; adapt to web and IIT/NIT eligibility |
| [starfish_v0](https://github.com/ayoniyi/starfish_v0) | Next.js/Supabase/Stream product surface with warm visual direction and realtime/video ambitions | Treat as inspiration; verify license and operational dependencies before reuse |
| [instagraming](https://github.com/jetsunlabsystems/instagraming) | Social feed, stories, group chats, event communities, GraphQL/Prisma/Postgres separation | Forked project with low visible activity; do not adopt its stack without a migration/security review |
| [Weekend](https://github.com/zypherlabs-bit/Weekend) | Dating plus social discovery and real-world plans | Android-oriented and small project; use domain ideas, not production foundation |
| [Crush](https://github.com/cryptothud/dating-app) | Domain-oriented monorepo, derived presence, location fuzzing, Redis hot-path separation, safety modules | MIT is stated in README; location is intentionally out of P0 because exact location is not needed |

## Verification research

- The Ministry of Education's [higher-education charter](https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/Citizen_Charter_HE_2025.pdf) provides official institute website references.
- [IIT Delhi's CSC policy](https://csc.iitd.ac.in/services-miscellaneous-policies-privacy) states that students receive official addresses in `iitd.ac.in`.
- [NIT Trichy's official notices](https://www.nitt.edu/home/academics/notices/) and [CSG page](https://www.nitt.edu/home/students/facilitiesnservices/ComputerSupportGroup/csgstaff/) demonstrate `nitt.edu` as an official institute domain.
- The production allowlist must be reviewed against each institute's current official IT/admissions page and versioned in the database. A selected institute alone never grants verification.
- [JoSAA 2026](https://josaa.nic.in/josaa/) identifies the current admissions scope as 23 IITs and 31 NITs; [NITSER's institute page](https://www.nitcouncil.org.in/inst_introduction) lists the NIT family. These sources define the directory coverage target, but each institute's email domain still needs separate official IT-source review.

## Architecture conclusions

1. Use a modular monolith: Next.js App Router, server actions/route handlers, Supabase Postgres/Auth/Storage/Realtime.
2. Keep social participation separate from dating consent and age eligibility in both schema and authorization functions.
3. Put matching, eligibility, block checks, and capacity enforcement in database transactions or server-side functions.
4. Use cursor pagination and indexed feeds from the start.
5. Start with an explainable ranking score; do not expose a pseudo-scientific compatibility percentage.
6. Design desktop, tablet, and mobile compositions separately while sharing domain components and data hooks.

