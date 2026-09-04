import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export type MarketingPageKey = "gift-cards" | "loyalty" | "functions" | "nutrition";

export interface MarketingPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: { title: string; body: string }[];
  ctaTitle: string;
  ctaDescription: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export const marketingPages: Record<MarketingPageKey, MarketingPageContent> = {
  "gift-cards": {
    eyebrow: "Gift Cards",
    title: "Give the Gift of Great Pizza",
    subtitle:
      "Perfect for birthdays, thank-yous, and anyone who loves a proper feed. Gift cards coming soon — contact us to arrange a voucher in the meantime.",
    sections: [
      {
        title: "Digital & in-store",
        body: "We're setting up online gift cards. Until then, visit us at Coleman Rd or call to purchase a voucher for any amount.",
      },
      {
        title: "Corporate gifts",
        body: "Need bulk vouchers for staff or clients? Our team can help with custom amounts and invoicing.",
      },
    ],
    ctaTitle: "Want a gift card today?",
    ctaDescription: "Get in touch and we'll sort a voucher for your recipient.",
    primaryCta: { label: "Contact Us", href: "/contact" },
    secondaryCta: { label: "View Menu", href: ORDER_ONLINE_HREF },
  },
  loyalty: {
    eyebrow: "Loyalty",
    title: "Rewards for Regulars",
    subtitle:
      "We love seeing familiar faces. A loyalty program is on the way — order now and we'll make sure early supporters get first access.",
    sections: [
      {
        title: "Earn on every order",
        body: "Future loyalty perks will reward repeat orders online and in-store — think discounts, free sides, and birthday treats.",
      },
      {
        title: "Stay in the loop",
        body: "Follow us and check back here — we'll announce launch details soon.",
      },
    ],
    ctaTitle: "Order now, benefit later",
    ctaDescription: "Keep ordering your favourites — we'll reward our regulars when loyalty launches.",
    primaryCta: { label: "Order Now", href: ORDER_ONLINE_HREF },
    secondaryCta: { label: "Contact Us", href: "/contact" },
  },
  functions: {
    eyebrow: "Functions & Events",
    title: "Host Your Next Event With Us",
    subtitle:
      "Birthdays, sports nights, office parties, and community gatherings — we feed groups from 10 to 500 across Wantirna South and surrounds.",
    sections: [
      {
        title: "In-store functions",
        body: "Ask about hosting a casual function at our Wantirna South location — pizza, pasta, and room for your group. Ideal for after-work drinks, team catch-ups, and family celebrations.",
      },
      {
        title: "Off-site catering",
        body: "We deliver full catering packages to your venue. Packages start from $165 for 10–20 guests, with vegetarian options and clear allergen guidance on request.",
      },
      {
        title: "What we need from you",
        body: "Share your date, headcount, dietary notes, and delivery or pickup preference. We'll confirm timing with the kitchen and send a quote you can lock in.",
      },
      {
        title: "Lead times",
        body: "Smaller groups can often be turned around with a few days' notice. Larger events (50+) — give us as much notice as you can so we can plan dough, staffing, and delivery windows.",
      },
    ],
    ctaTitle: "Planning something big?",
    ctaDescription: "Tell us your date, headcount, and venue — we'll put together a quote.",
    primaryCta: { label: "Catering Quote", href: "/catering#catering-quote" },
    secondaryCta: { label: "Contact Us", href: "/contact" },
  },
  nutrition: {
    eyebrow: "Nutrition",
    title: "Nutrition & Portion Info",
    subtitle:
      "Our menu is built for flavour and generous Australian portions. Here's how to think about nutrition while detailed panels roll out.",
    sections: [
      {
        title: "GST-inclusive pricing",
        body: "All menu prices include GST. Deals and catering packages show total prices upfront so there are no surprises at checkout.",
      },
      {
        title: "Portion sizes",
        body: "Pizzas are designed to share. A large typically feeds 2–3 hungry adults depending on toppings and sides. Kids' and smaller serves are available for some items — ask when you order.",
      },
      {
        title: "Customisation affects totals",
        body: "Extra toppings, premium crusts, and sides change calories and price — your cart shows the final amount before checkout.",
      },
      {
        title: "Balanced plates",
        body: "Pair a pizza with a salad or veggie side, or choose lighter toppings. Vegetarian badges help you spot plant-forward options on the menu.",
      },
      {
        title: "Questions?",
        body: "For specific dietary or nutrition questions, contact our team before ordering — especially if you have medical dietary needs.",
      },
    ],
    ctaTitle: "Need allergen details?",
    ctaDescription: "See our allergens page for kitchen and ingredient guidance.",
    primaryCta: { label: "Allergen Info", href: "/allergens" },
    secondaryCta: { label: "View Menu", href: ORDER_ONLINE_HREF },
  },
};
