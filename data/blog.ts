export interface BlogStubPost {
  slug: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  category: string;
}

export const blogHero = {
  eyebrow: "Blog",
  title: "Stories From the Oven",
  subtitle:
    "Kitchen notes, Wantirna South favourites, catering tips, and what's cooking at Benny Boy's.",
};

/** Editorial stubs shown when the CMS has no published posts yet. */
export const blogStubPosts: BlogStubPost[] = [
  {
    slug: "wantirna-south-pizza-night",
    title: "Friday Night Pizza Done Right",
    excerpt:
      "Why Coleman Rd locals keep coming back for shareable pies, cold drinks, and a proper Friday feed.",
    dateLabel: "Mar 2026",
    category: "Local",
  },
  {
    slug: "catering-for-office-lunches",
    title: "Catering That Actually Feeds the Room",
    excerpt:
      "How we plan pizzas, pasta, and sides for offices, sports clubs, and birthday crowds from 10 to 500.",
    dateLabel: "Feb 2026",
    category: "Catering",
  },
  {
    slug: "customising-your-order",
    title: "Build It Your Way",
    excerpt:
      "Sizes, crusts, leave-offs, and extras — a quick guide to getting your online order exactly how you like it.",
    dateLabel: "Jan 2026",
    category: "Ordering",
  },
  {
    slug: "allergens-and-dietary-tips",
    title: "Ordering With Dietary Needs",
    excerpt:
      "What to know about our kitchen, badges on the menu, and when to call ahead for allergies.",
    dateLabel: "Jan 2026",
    category: "Dietary",
  },
];
