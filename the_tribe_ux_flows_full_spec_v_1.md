# The Tribe — UX Flows & Full Specification (v1.0)

**Owner:** Jonathan Anderson (President Anderson)  
**Date:** Oct 19, 2025  
**Context:** Aligns with *Jonathan Anderson — Master Brief (Oct 7, 2025)*. Purpose: Convert vision into an execution-ready blueprint spanning UX, product, data, and delivery.

---

## 0) Executive Summary
The Tribe is a mobile platform (iOS/Android) that matches people with social experiences based on an **Elemental Persona** (Fire, Water, Earth, Air, optional Ether). It turns routine into adventure by curating events, micro‑communities (tribes), and real‑world serendipity with a safety‑first, data‑minimal approach.

**North Star Metric:** Monthly Active Joy (MAJ) = # of users who attend >=1 event + self‑report positive mood delta in a month.

**Secondary Metrics:** Event conversions, Net New Connections, Host revenue, Retention D30, Element Balance Score improvement.

---

## 1) Elemental Personas (Product Primitive)
- **Fire**: movement, expression → dance, fitness, nightlife, high‑energy.  
- **Water**: connection, restoration → saunas, lake/river, breathwork, deep talks.  
- **Earth**: craft, grounding → cooking circles, gardening, pottery, workshops.  
- **Air**: curiosity, exploration → talks, travel jams, co‑working pop‑ups, improv.  
- **Ether (optional)**: consciousness, ritual → meditation, sound journeys, ceremony.  

**Persona Representation:** `primary_element`, `secondary_element`, `balance_vector[5]`, `contra_element`.  
**Adaptation:** Vector updates via attendance, feedback, mood deltas.

---

## 2) End‑to‑End UX Flow Diagrams (Textual)

### A) New User → First Event (Happy Path)
1. **Splash** → CTA: *Find Your Tribe*  
2. **Account**: Apple/Google/email (silent profile stub)  
3. **Onboarding Quiz** (~8 questions) → compute `primary/secondary`  
4. **Consent & Safety** (location, notif, code of conduct)  
5. **Home (Feed + Map)** seeded by city + element mix  
6. **Event Details** → see vibe tags + attendees preview  
7. **Ticket/RSVP** → Apple/Google Pay/Stripe  
8. **Calendar + QR Pass** saved; pre‑event icebreaker prompt  
9. **Check‑in (QR)** at door  
10. **Post‑Event Micro‑survey** (mood delta, people met)  
11. **Personalized Next Picks** + invite to join/host tribe

### B) Host Creation Flow
1. Profile → *Become a Host*  
2. KYC Lite (ID scan) + Stripe Connect onboarding  
3. Create Tribe (name, element, city, banner)  
4. Create Event (template, capacity, price, safety notes)  
5. Publish → Review (auto + human) → Listed  
6. Sales/RSVP dashboard, QR check‑in, post‑event wrap

### C) Safety & Trust Flow
1. Report user/event → quick triage form  
2. Auto‑rules (spam/NSFW/harassment) + Trust Console review  
3. Outcomes: warn, mute, refund, ban, escalate  
4. Evidence saved to case log; host notified with guidance

### D) Social Fabric Flow
1. Attend same event → *Kindred Suggestions*  
2. Tap to connect → double‑opt chat open  
3. Ice‑breaker prompts tied to event theme  
4. Connection health tracked via replies/meetups tagged

### E) Element Balance Coaching Flow
1. Weekly recap → heatmap of activities vs. mood  
2. Coach nudges: *You’re high Fire; try Water this week*  
3. Goal: plan 1 cross‑element experience → follow‑up check

---

## 3) Screen‑by‑Screen Specifications

### 3.1 Authentication & Onboarding
**Screens:** Splash → Sign In → Quiz → Permissions → Code of Conduct  
**Key Components:**  
- SSO (Apple, Google), email/password (Auth0/Firebase Auth).  
- Quiz: multi‑select preferences, energy scales, social comfort.  
- Output: `{primary, secondary, balance_vector, city}`.  
- Copy references the Master Brief ethos: joy, connection, integrity.

### 3.2 Home (Feed & Map)
- **Feed Tabs:** *For You*, *Trending*, *By Element*.  
- **Map:** clusters of events, filter: date range, price, capacity, element.  
- **Card:** banner, title, element chips, distance, start time, price, 3 attendee avatars.

### 3.3 Search & Filters
- Query by title, tags, venue, tribe.  
- Saved searches (e.g., *Water + Montreal Fridays*).  
- Smart filters: *Solo‑friendly*, *No alcohol*, *Outdoors*, *Wheelchair accessible*.

### 3.4 Event Detail
- Hero image/video; element ribbon; host trust badge.  
- What to expect (bulleted), Vibe meter (Chill ←→ Intense).  
- Logistics: time, map, transit, parking, safety notes.  
- People preview: mutuals, kindreds.  
- CTA: **RSVP / Buy**; secondary: *Message host*, *Share*.

### 3.5 Ticketing & Wallet
- Stripe checkout (Apple/Google Pay).  
- Wallet: QR passes, refunds, transfers, guest+1.  
- Policies: cancel window, no‑show rules.

### 3.6 Check‑in
- Host app mode: scan QR; offline fallback; capacity counter.  
- Auto‑welcome message + event chat open.

### 3.7 Mood & Energy Journal
- Pre/post sliders: *Energy*, *Belonging*, *Joy*.  
- Optional notes; photo memory.  
- AI insight after 3+ events.

### 3.8 Tribes (Communities)
- Tribe page: banner, description, rules, events, members.  
- Roles: leader, scout, guardian (moderation).  
- Join/Request; application questions optional.  
- Badges: *Connector*, *Healer*, *Maker*, *Explorer*.

### 3.9 Host Console
- Create: template presets (Dance Night, Sauna Social, Makers Circle).  
- Pricing: flat, tiered, pay‑what‑you‑can, free with RSVP cap.  
- Inventory: capacity, waitlist, auto‑release rules.  
- Messaging: broadcast to RSVPs; schedule reminders.  
- Post‑event: export attendee list; prompt reviews; payouts.

### 3.10 Messaging
- 1:1 and event‑chat (ephemeral by default, 14 days).  
- Safety: block, rate‑limit, AI toxic filter, photo safety blur.

### 3.11 Profile & Settings
- Profile: element badge, interests, tribes, attended count.  
- Privacy: show city only, hide last name, proximity radius.  
- Safety: trusted contacts, check‑out nudges, location sharing.

---

## 4) Information Architecture
- **Top Nav:** Home, Search, Tribes, Wallet, Profile.  
- **Deep Links:** `tribe://event/{id}`, `tribe://tribe/{id}`, `tribe://invite/{code}`.  
- **Notifications:** transactional (tickets), relational (connections), coaching (element balance).

---

## 5) Data Model (Initial)

### Users
- `id`, `created_at`, `auth_provider`, `email_hash`, `display_name`, `photo_url`  
- `primary_element` (enum), `secondary_element` (enum), `balance_vector` (float[5])  
- `city`, `coords` (approx), `privacy_flags{}`  
- `safety_score` (float), `ban_state` (enum)

### Tribes
- `id`, `name`, `slug`, `city`, `element_focus`, `banner_url`  
- `bio`, `rules_md`, `member_count`, `badges[]`  
- `owner_id`, `roles{user_id→role}`

### Events
- `id`, `tribe_id`, `host_id`, `title`, `description_md`  
- `elements[]`, `tags[]`, `vibe_meter` (0–100), `safety_notes_md`  
- `start_at`, `end_at`, `venue{address, lat, lng}`, `capacity`, `age_min`  
- `pricing{type, tiers[]}`, `policy{refund_window, transfer}`  
- `status` (draft/review/live/ended), `cover_url`.

### Tickets / RSVPs
- `id`, `event_id`, `user_id`, `status` (paid/confirmed/cancelled/no_show)  
- `qr_token`, `checkin_at`, `payment_id`, `guest_plus_one_id?`.

### Mood Logs
- `id`, `user_id`, `event_id?`, `pre{energy,belonging,joy}`, `post{...}`, `notes`.

### Connections
- `id`, `user_a`, `user_b`, `source` (event/match), `state` (pending/active/muted).

### Moderation Cases
- `id`, `target_type`, `target_id`, `reporter_id`, `reason`, `evidence[]`, `outcome`.

---

## 6) API Surface (REST/Graph Hybrid)
**Auth**  
- `POST /auth/login` (SSO tokens)  
- `GET /me`

**Persona**  
- `POST /persona/quiz` → `balance_vector`  
- `GET /persona/recs` → events[]

**Events**  
- `GET /events?lat,lng,element,from,to,price_min,max`  
- `GET /events/{id}`  
- `POST /events` (host)  
- `POST /events/{id}/publish`  
- `POST /events/{id}/message`

**Tickets**  
- `POST /events/{id}/tickets` → Stripe session  
- `POST /tickets/{id}/refund`  
- `POST /checkin/{qr_token}`

**Tribes**  
- `GET /tribes?city,element`  
- `GET /tribes/{id}`  
- `POST /tribes` (host)  
- `POST /tribes/{id}/join`

**Social**  
- `POST /connect/{user_id}`  
- `POST /messages` (scoped)  
- `POST /reports`

**Analytics**  
- `POST /logs/mood`  
- `GET /me/recap`

Webhooks: Stripe, Fraud/AB test, Image moderation.

---

## 7) Recommendation Engine (MVP → V2)
**Signals** (MVP): element match, distance, time, price, tribe reputation, host rating, popularity, friend‑going.  
**Personalization:** cosine similarity on `balance_vector` vs event `elements[]` vector; boost novelty & cross‑element targets (5–15%).  
**V2:** contextual bandits using post‑event mood delta as reward; cold‑start via quiz priors.

---

## 8) Safety, Trust & Compliance
- **Identity:** KYC for paid hosts; optional verify for users.  
- **Harms:** ML filters (toxicity, sexual content for minors), geo‑fencing sensitive areas.  
- **Controls:** block, mute, distance radius, private mode.  
- **Moderation Console:** queues, case trails, SLA.  
- **Legal:** TOS/Community Guidelines; age gates; refunds rubric.  
- **Privacy:** data minimization; encrypted PII; granular consent; GDPR/Quebec Law 25 alignment.

---

## 9) Monetization & Pricing
- **Free:** discover, RSVP free events, journal, basic chat.  
- **Pro ($9.99/mo):** host small events, element insights, saved spots.  
- **Premium ($29.99/mo):** verified tribe, analytics, boosts, advanced ticketing.  
- **Rev Share:** 5–12% on paid tickets; local brand takeovers; seasonal passes.

---

## 10) Gamification & Rituals
- **XP & Titles:** Explorer, Connector, Leader, Healer, Maker.  
- **Streaks:** weekly adventure streak with cross‑element bonus.  
- **Rituals:** First‑Friday Council; Seasonal Quests (equinox/solstice).  
- **Loot:** merch drops, secret rooms, partner perks.

---

## 11) Design System (Atomic)
- **Palette:** element gradients; dark‑first UI.  
- **Type:** rounded sans + tribal rune accents (sparingly).  
- **Components:** cards, chips (element), map pins, ticket tiles, QR cells, vibe meter.  
- **Motion:** water‑like easing, fire bursts, air slides, earth settles.

---

## 12) Analytics & Insight Framework
- Event funnel: impressions → detail → checkout start → purchase → check‑in → mood delta.  
- Social: matches made, reply rate, repeated meetups.  
- Host: fill rate, cancel/no‑show, NPS, dispute rate.  
- Health: MAJ, D7/D30 retention by element, cross‑element adoption.

---

## 13) Tech Stack & Dev Notes
- **Mobile:** React Native (Expo) or Flutter; deep links; OTA updates.  
- **Backend:** Node/NestJS; PostgreSQL + PostGIS; Redis for feed.  
- **Search:** OpenSearch/Algolia for events/tribes.  
- **AI:** embeddings for tags; bandits for recs; moderation endpoints.  
- **Infra:** Vercel (edge functions) + AWS RDS; CloudFront CDN.  
- **Observability:** Sentry, Datadog; privacy‑safe product analytics (PostHog/Snowplow).  
- **Sec:** JWT + rotating refresh; field‑level encryption for PII.

---

## 14) Delivery Plan (Roadmap)
**Phase 0 — Proof (4–6 wks)**  
- Quiz → element profile, seed content, static event list, Stripe checkout sandbox, QR check‑in, mood log.  

**Phase 1 — Montreal Pilot (8–10 wks)**  
- Live event marketplace (5–10 verified hosts), map, chat, host console, moderation basics, MAJ tracking.  

**Phase 2 — Scale (12–16 wks)**  
- Recs v2, social graph, tribes network, brand partnerships, Trust Console v2, analytics pipeline.  

**Gate Reviews:** ethics & safety, privacy, NPS, cash flow.

---

## 15) Acceptance Criteria (MVP)
- New user can reach a paid event purchase in < 90 seconds from splash (first‑time).  
- QR check‑in success rate ≥ 99.5% (online) / ≥ 98% (offline).  
- Post‑event survey completion ≥ 55%.  
- Refund processing < 2 minutes (auto) for eligible cases.  
- Toxic content false‑negative rate ≤ 1% in chat (sampled).  
- App crash‑free sessions ≥ 99.8%.

---

## 16) Open Questions (to refine with stakeholders)
- Minimum age and ID tiers by event type?  
- Host insurance proof for certain categories?  
- Default chat lifetime (7 vs 14 days)?  
- Geo‑launch sequence after Montreal (Toronto, NYC?), tied to Master Brief outreach.

---

## 17) Appendices
**A. Vibe & Tag Taxonomy (seed)**  
- Fire: Latin, EDM, Afro, HIIT, Combat flow, Street dance.  
- Water: Sauna, Cold plunge, Breathwork, Tea circle, Hammam.  
- Earth: Pottery, Fermentation, Foraging, Woodshop, Textile.  
- Air: Debate, Poetry, Hack night, Travel jam, Improv, Salon.  
- Ether: Meditation, Sound bath, Cacao, Ceremony, Astrology.  

**B. Content Policy Rubrics** (event imagery, claims, age‑sensitivity).  
**C. Host Review Playbook** (risk tiers, refunds, ban matrix).  

— End of v1.0 —

