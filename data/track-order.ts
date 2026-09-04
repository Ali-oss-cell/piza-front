import type { FaqItem } from "@/components/motion/faq-accordion";

export const trackOrderHero = {
  eyebrow: "Track Order",
  title: "Where's My Order?",
  subtitle:
    "Online orders run through our ordering partner. Use your confirmation details below, or get in touch and we'll help chase it down.",
};

export const trackOrderSteps = [
  {
    title: "Check your confirmation",
    description:
      "After checkout you should receive an order confirmation with a reference number and estimated ready or delivery time.",
  },
  {
    title: "Open your order portal",
    description:
      "Most online orders can be viewed again in the NextOrder confirmation email or account linked to the phone/email you used.",
  },
  {
    title: "Still unsure? Contact us",
    description:
      "Call the store or send a message with your name, phone, and approximate order time — our team can check the kitchen queue.",
  },
];

export const trackOrderFaqs: FaqItem[] = [
  {
    question: "I ordered online — how do I track it?",
    answer:
      "Use the confirmation email or SMS from our online ordering partner (NextOrder). It includes your order status and expected pickup or delivery window.",
  },
  {
    question: "I ordered by phone or in store",
    answer:
      "Phone and counter orders aren't always visible in the online tracker. Call Benny Boy's Wantirna South with your name and order time and we'll update you.",
  },
  {
    question: "My order is late",
    answer:
      "Busy nights and traffic can add a few minutes. If you're past the quoted window, contact us with your order reference so we can prioritise an update.",
  },
  {
    question: "Can I change or cancel an order?",
    answer:
      "Changes depend on how far along the kitchen is. Contact us as soon as possible — once pizza is in the oven we usually can't modify it.",
  },
];
