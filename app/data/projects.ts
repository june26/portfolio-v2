export type Project = {
  slug: string; // the Firestore document id, used in the URL: /projects/<slug>
  name: string;
  category: string;
  imageUrl: string;
  year: string;
  role: string;
  stack: string[];
  summary: string;
  client: string;
  company?: string; // where it was built, shown only when filled in
  scope: string[];
  narrative: string[];
};
