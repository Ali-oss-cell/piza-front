import type { FaqItem } from "@/components/motion/faq-accordion";

export const faqSections: { title: string; items: FaqItem[] }[] = [
  {
    title: "Ordering",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Browse our menu online, add items to your cart, and checkout for pickup or delivery. You can also call us or visit the store at 100 Coleman Rd, Wantirna South.",
      },
      {
        question: "Can I schedule an order for later?",
        answer:
          "Yes — at checkout you can pick a date and time that suits you, subject to our opening hours and kitchen capacity.",
      },
      {
        question: "Is there a minimum order?",
        answer:
          "Minimum order amounts may apply for delivery. You'll see any minimum at checkout before you pay.",
      },
    ],
  },
  {
    title: "Delivery & pickup",
    items: [
      {
        question: "How far do you deliver?",
        answer:
          "We deliver across Wantirna South and surrounding suburbs in Melbourne's east. Enter your address at checkout to confirm we can reach you.",
      },
      {
        question: "How much is delivery?",
        answer:
          "Flat-rate delivery applies to most orders — the exact fee is shown at checkout before you confirm payment.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Typical delivery is 30–45 minutes depending on distance and how busy the kitchen is. Pickup is usually ready sooner.",
      },
    ],
  },
  {
    title: "Menu & dietary",
    items: [
      {
        question: "Do you have vegetarian or vegan options?",
        answer:
          "Yes — look for vegetarian items on the menu and customise toppings when you order. Ask our team about vegan swaps.",
      },
      {
        question: "Can I customise my pizza?",
        answer:
          "Absolutely. Choose your size, crust, toppings, and any ingredients to leave off when you build your order.",
      },
      {
        question: "Where can I find allergen information?",
        answer:
          "See our Allergens page for a general guide. If you have a severe allergy, please call us before ordering so we can advise safely.",
      },
    ],
  },
  {
    title: "Payments & issues",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major cards online and in-store, plus cash at pickup. Corporate catering can be invoiced on request.",
      },
      {
        question: "Something was wrong with my order — what do I do?",
        answer:
          "Contact us as soon as possible with your order number. We'll make it right — that's how we keep neighbours coming back.",
      },
    ],
  },
];

export const faqHero = {
  eyebrow: "Help Centre",
  title: "Frequently Asked Questions",
  subtitle:
    "Quick answers about ordering, delivery, dietary options, and everything else you need to know.",
};
