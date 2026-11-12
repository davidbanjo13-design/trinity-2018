# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the Year 11 cohort of Trinity School Bexley, class of 2018.** Roughly
150–200 people, now around 25 years old, largely in or around Bexley and London.
They arrive on a phone, from a link someone they know has shared, with no prior
knowledge that a reunion is being organised. Most will decide in under a minute
whether this is real and whether they are in.

Their job: find out it is happening, confirm they want in without committing
money or a date, and optionally leave something of themselves — a memory, a
photo — for the people they have not seen in eight years.

**Secondary: Trinity School Bexley itself**, as a prospective venue. The school
is not a user of the site, but a registration list is the evidence that gets a
hall-hire conversation taken seriously. Future work should assume a member of
school staff may look at this page and judge it.

## Product Purpose

Organise the Trinity School Bexley Year 11 2018 reunion, and run it well.

Success is a real event that happens, with enough of the year group there that
it was worth doing. Before that: enough free registrations to prove demand is
real and to justify committing to a venue.

A second purpose exists and is deliberately not being built yet — everything
learned organising this becomes the specification for software that lets any
state-school year group do the same. That product is not started until this
reunion has happened once.

## Positioning

**Reunions in the UK happen for people with an alumni office.** Independent
schools and universities run them routinely, because they have paid staff,
budgets and contact databases. State secondaries have none of that: no alumni
department, no budget, no contact list, and nobody whose job it is. The demand
is the same; only the machinery is missing.

That is the gap this occupies — not "the UK doesn't do reunions", which is
false, but "state school year groups have the demand and none of the
infrastructure."

Evidence the demand is real: the Newham Schools Reunion (July 2026, Faces
nightclub, Ilford) was state-school, ticketed, commercially organised, and
about ten miles from Bexley. Existing tooling (ClassCreator, ClassReport,
Eventbrite) is generic, largely US-origin event software. Nobody owns "state
school reunion" as a category.

## Operating Context

**Registration comes before everything.** It is free and non-committal, which
is what allows the site to exist before a venue, a date or a price. Demand is
measured first; obligations are taken on second.

**Distribution is link-sharing across every channel available at once** — the
year group WhatsApp, smaller friendship-circle chats, Instagram, and direct
messages. There is no single channel that reaches the cohort, so the share
preview card and the shareability of the link are load-bearing, and traffic
will be bursty rather than steady.

**Moderation is manual and personal.** Every memory and every photo is approved
by the organiser in the Supabase dashboard before it appears. He is the
publisher of everything on the wall.

**The organiser is solo.** No co-organisers are confirmed. Anything requiring
sustained daily effort will not get done.

## Capabilities and Constraints

**Built and live:**
- Landing page carrying the organiser's own account of why the reunion exists
- Free registration: first name, last name, email, year-group confirmation,
  optional written memory, optional up to three photos
- Live signup counter, built to become an "X of the Y we need" threshold bar
- Moderated memories wall: approved photos on a scroll-driven scatter stage,
  approved text memories in a grid below
- Share preview card for messaging apps
- Plain-English privacy notice with a removal route
- First-party analytics (page views, funnel steps, referrer) with no cookies
  and no device storage

**Deliberately not built:** ticketing, payments, login, user profiles, an admin
dashboard, multi-school support. Ticketing is added only once a threshold is
hit and a venue is contractually confirmed.

**Technical constraints:**
- Static site on Netlify, auto-deploying from GitHub
- Supabase free tier: the database **pauses after seven days of low activity
  and does not auto-resume**. While paused the site looks fine and every signup
  silently fails. No keep-alive is configured; this is a known accepted risk.
- The public API key can insert only. It cannot read the signup list, and
  unapproved photos are unreadable by anyone.
- No email sending is configured. A mistyped address is a person who can never
  be reached, and there is currently no way to mail the list from the product.

**Undecided product facts — do not invent these:**
- The reunion date. Intended summer 2027, after final-year exams. Not set.
- The venue. School hall is the preference, not a commitment; alcohol
  licensing and safeguarding may rule it out.
- Ticket price. £25–40 is a hypothesis from comparable events, not a decision.
- Break-even headcount. Unknown until venue cost is known. The counter's
  target stays null until then.
- Whether a fixed per-ticket donation to the school fund happens, and how much.
- The reunion contact email address. The privacy notice currently carries a
  visible placeholder where it should be.

## Brand Commitments

- **The organiser's own writing is binding.** Roughly 257 words of first-person
  copy across the landing page are his, and are preserved verbatim. The main heading was
  set by him on 12 November 2026; everything else is untouched
  and should stay that way. Future work must not rewrite, tighten or
  "improve" this copy without being asked.
- **Name:** "Trinity Reunion 2018".
- **School name:** "Trinity School Bexley" is current and unchanged, confirmed
  12 November 2026.
- **Voice:** first person, direct, warm, a bit blunt. Written by someone in the
  year group, not by an organisation. It is not polished and should not be
  polished.
- **Not affiliated with the school.** The site is run by one former pupil. It
  must never imply it is an official school communication.

## Evidence on Hand

- **Hero photograph: generated, not documentary.** The hero image was made with
  an image model. It depicts an adult in a school corridor facing a mirror that
  reflects schoolchildren. It is illustrative and must never be presented or
  captioned as a real photograph of Trinity, of the year group, or of anyone.
- **User-submitted photos:** four approved at the time of writing, plus one
  test artifact that should be deleted. These are real photos from real people.
- **Registrations:** two, both test/organiser accounts. No genuine public
  signups yet.
- **Text memories:** one submitted, not yet approved.
- **No testimonials, no attendance figures, no press, no venue quote, no
  ticket sales.** None of these exist and none may be fabricated or implied.
- The Newham Schools Reunion is a cited comparable, but its organiser has not
  been contacted and its turnout is unverified.

## Product Principles

1. **Free registration before any commitment.** Find out whether demand is real
   before owing anyone a venue, a date or a refund.
2. **The counter is the growth mechanic, not vanity.** Once break-even is
   known it becomes "X of the Y we need for this to happen", which makes every
   signup consequential and gives people a reason to share.
3. **This is for one year group, and says so.** Exclusivity is the point. The
   site is shared by link, kept out of search, and makes no attempt to be
   discoverable by strangers.
4. **The organiser is personally accountable for everything published.** These
   are real people he will see in a room. Moderation is manual by design, and
   anyone can ask to be removed.
5. **The event is the product, not a social network.** Ongoing means an email
   list, a memories wall, and doing it again next year — not a platform
   competing with WhatsApp.

## Accessibility & Inclusion

No formal standard is contractually required, but WCAG AA is the working floor
and has been verified by measurement rather than assumed: every text/background
pairing in the current palette clears AA for body text.

Established requirements:
- `prefers-reduced-motion` is honoured on every animated path, including the
  scroll-driven stage, which falls back to a static layout.
- No content is hidden behind JavaScript that may not arrive. The registration
  form works without the animation layer.
- Form fields are set at a 16px minimum so iOS does not zoom on focus.
- The audience is on mid-range phones over mobile data. Weight and resilience
  are accessibility concerns here, not just performance ones.
