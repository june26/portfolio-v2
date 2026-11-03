# Portfolio notes

Ported from `source.html` (a rendered snapshot of a Vite/React page) to Next.js.

## Structure
- `app/data/profile.ts` – name, role, email, social links. Edit here.
- `app/data/about.ts` – About page copy (bio, skills, steps, stats).
- `app/data/projects.ts` – project list (name, category, image).
- `app/components/Portfolio.tsx` – holds the current page (home / about / contact) and slides the 3 panels.
- `app/components/Sidebar.tsx` – name, role, About + Contact icon buttons.
- `app/components/ProjectReel.tsx` – infinite reel: wheel moves one project per scroll (spring), cards are positioned by a looping index.
- `app/components/ReelItem.tsx` – position/tilt/fade per project, only the centered one is clickable.
- `app/components/ProjectDetail.tsx` – project page: floating card with toolbar; a copy of the card image resizes between the card and the cover on open and close.
- `app/components/AboutPage.tsx`, `ContactPage.tsx` – the two extra pages, each with a Back button.
- `IconLink`, `BackButton`, `SocialLink`, `PageHeader`, `ProjectCard` – small reusable pieces.

## Decisions / TODO
- Colors in `app/globals.css` are a guess (source CSS wasn't included).
- About copy, location and portrait are placeholders copied from `source2.html`; replace them.
- Social urls are generic (linkedin.com etc.); put your own profile links in `profile.ts`.
- Contact form has no backend: Send opens the visitor's email app with the message filled in.
- Project detail text (year, role, stack, summary in `projects.ts`) is placeholder; replace with real info.
- Pages are React state, not routes (no URL change / browser back button).
- Icons come from the Remix Icon CDN, as in the source.
