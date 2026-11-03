export type Project = {
  name: string;
  category: string;
  imageUrl: string;
  year: string;
  role: string;
  stack: string[];
  summary: string;
  client: string;
  scope: string[];
  narrative: string[];
};

export const projects: Project[] = [
  {
    name: "Vellum",
    category: "Design System · React",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Flat%20lay%20of%20printed%20interface%20screens%20and%20component%20swatch%20cards%20in%20cream%20and%20bone%20on%20a%20warm%20sand%20desk%2C%20thin%20terracotta%20accent%20lines%2C%20soft%20diffused%20daylight%2C%20minimal%20design%20system%20documentation%20aesthetic%2C%20fine%20grain%2C%20high%20detail%2C%20no%20legible%20text&width=1200&height=900&seq=portfolio-vellum-ds01&orientation=landscape",
    year: "2025",
    role: "Lead frontend engineer",
    stack: ["React", "TypeScript", "Storybook"],
    summary:
      "A token-driven component library with documentation, built so a rebrand is a one-file change.",
    client: "Vellum Labs",
    scope: ["Design tokens", "Component library", "Documentation"],
    narrative: [
      "The product had three buttons, five greys and no shared language. I started by extracting a small set of design tokens, so color, spacing and type were defined once and consumed everywhere.",
      "On top of that I built typed React components with Storybook docs and visual tests. A full rebrand now lands as a one-file change and ships the same day.",
    ],
  },
  {
    name: "Northwind",
    category: "E-commerce · Next.js",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Minimal%20studio%20photograph%20of%20a%20matte%20laptop%20open%20to%20a%20calm%20product%20listing%20interface%20on%20a%20warm%20bone%20desk%20beside%20a%20folded%20linen%20cloth%2C%20long%20soft%20afternoon%20shadow%2C%20muted%20clay%20accents%2C%20editorial%20product%20photography%2C%20fine%20film%20grain%2C%20harmonious%20composition%2C%20high%20detail&width=1200&height=900&seq=portfolio-northwind-02&orientation=landscape",
    year: "2024",
    role: "Frontend engineer",
    stack: ["Next.js", "Tailwind", "Stripe"],
    summary:
      "A calm product-listing and checkout experience focused on speed on low-end phones.",
    client: "Northwind Goods",
    scope: ["Storefront rewrite", "Checkout", "Performance"],
    narrative: [
      "The old storefront was heavy on low-end phones. I rebuilt the listing and checkout with Next.js server rendering and shipped only the JavaScript each page needs.",
      "Largest Contentful Paint dropped by more than half, and the checkout flow lost two steps without losing any information.",
    ],
  },
  {
    name: "Cadence",
    category: "Dashboard · Data Viz",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Clean%20photograph%20of%20a%20wide%20monitor%20displaying%20a%20restrained%20analytics%20dashboard%20with%20thin%20line%20charts%20in%20terracotta%20and%20olive%20on%20a%20bone%20background%2C%20warm%20evening%20desk%20light%2C%20minimal%20neutral%20studio%20surroundings%2C%20fine%20grain%2C%20high%20detail%2C%20no%20legible%20text&width=1200&height=900&seq=portfolio-cadence-03&orientation=landscape",
    year: "2024",
    role: "Frontend engineer",
    stack: ["React", "D3", "TypeScript"],
    summary:
      "A restrained analytics dashboard where thin charts and clear hierarchy do the talking.",
    client: "Cadence Analytics",
    scope: ["Dashboard", "Data visualization", "Virtualised tables"],
    narrative: [
      "The dashboard had to show years of data without feeling heavy. Thin lines, quiet colors and one clear hierarchy let the numbers do the talking.",
      "Large tables are virtualised and charts render on demand, so scrolling stays smooth even with a hundred thousand rows.",
    ],
  },
  {
    name: "Fieldnote",
    category: "Editorial · Astro",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Overhead%20editorial%20photograph%20of%20an%20open%20printed%20magazine%20with%20wide%20single%20column%20layout%20and%20a%20pencil%20beside%20it%20on%20a%20warm%20greige%20table%2C%20soft%20window%20light%20raking%20across%20uncoated%20paper%2C%20muted%20olive%20cloth%20corner%2C%20quiet%20minimal%20styling%2C%20fine%20grain%2C%20high%20detail&width=1200&height=900&seq=portfolio-fieldnote-04&orientation=landscape",
    year: "2023",
    role: "Design engineer",
    stack: ["Astro", "MDX", "CSS"],
    summary:
      "A single-column editorial site tuned for reading, with almost no JavaScript.",
    client: "Fieldnote Press",
    scope: ["Editorial site", "Reading experience", "Content pipeline"],
    narrative: [
      "A reading-first site: one column, generous type and almost no JavaScript. Pages are static and load instantly.",
      "Writers publish from Markdown files, and the build handles images, feeds and reading time automatically.",
    ],
  },
  {
    name: "Helio",
    category: "Marketing Site · Motion",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Abstract%20minimal%20studio%20scene%20of%20layered%20warm%20sand%20and%20bone%20paper%20planes%20floating%20at%20slight%20angles%20over%20a%20soft%20cream%20backdrop%2C%20long%20gentle%20shadows%2C%20subtle%20terracotta%20edge%20highlight%2C%20editorial%20graphic%20still%20life%2C%20fine%20grain%2C%20harmonious%20composition%2C%20high%20detail&width=1200&height=900&seq=portfolio-helio-05&orientation=landscape",
    year: "2023",
    role: "Frontend engineer",
    stack: ["React", "Motion", "WebGL"],
    summary:
      "A marketing site with layered motion that stays smooth and respects reduced-motion.",
    client: "Helio Energy",
    scope: ["Launch page", "Scroll motion", "Accessibility"],
    narrative: [
      "A launch page where layered motion explains the product as you scroll, tuned to hold 60 frames on mid-range phones.",
      "Every animation respects reduced-motion, and the page stays fully usable with the keyboard and a screen reader.",
    ],
  },
  {
    name: "Relay",
    category: "Web App · Realtime",
    imageUrl:
      "https://readdy.ai/api/search-image?query=Calm%20photograph%20of%20two%20tablets%20and%20a%20small%20laptop%20arranged%20on%20a%20warm%20linen%20surface%20showing%20plain%20text%20editing%20documents%20in%20cream%20and%20charcoal%2C%20soft%20morning%20light%20from%20a%20side%20window%2C%20muted%20clay%20ceramic%20cup%2C%20minimal%20scandinavian%20styling%2C%20fine%20grain%2C%20high%20detail&width=1200&height=900&seq=portfolio-relay-06&orientation=landscape",
    year: "2022",
    role: "Frontend engineer",
    stack: ["React", "WebSockets", "CRDT"],
    summary:
      "A realtime text editor for small teams, with presence and conflict-free editing.",
    client: "Relay Teams",
    scope: ["Realtime editor", "Presence", "Offline support"],
    narrative: [
      "A plain-text editor where several people write at once without stepping on each other. Edits merge with CRDTs, so conflicts simply do not happen.",
      "Presence cursors, offline editing and instant sync make it feel like a local app that happens to be shared.",
    ],
  },
];

// Placeholder gallery: the first image is the card image, the others are generated variations of it.
export function getGalleryImageUrls(project: Project, count = 3) {
  const extraImages = Array.from({ length: count - 1 }, (_, index) =>
    project.imageUrl.replace(/seq=([^&]+)/, `seq=$1-${index + 2}`),
  );
  return [project.imageUrl, ...extraImages];
}
