export type Project = {
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
