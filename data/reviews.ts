export interface Review {
  name: string;
  suburb: string;
  rating: number;
  quote: string;
  date: string;
}

export const reviews: Review[] = [
  {
    name: "Sarah M.",
    suburb: "Wantirna South",
    rating: 5,
    quote:
      "Best pizza in the area — always hot, always generous toppings. The kids love the deals and we order every Friday.",
    date: "2025",
  },
  {
    name: "James T.",
    suburb: "Knoxfield",
    rating: 5,
    quote:
      "Catered our office lunch — fed 30 people on time and the team is still talking about the garlic bread.",
    date: "2025",
  },
  {
    name: "Priya K.",
    suburb: "Bayswater",
    rating: 5,
    quote:
      "Reliable delivery, friendly staff on the phone, and they actually listen when you ask for extra chilli.",
    date: "2024",
  },
  {
    name: "Mark & Lisa",
    suburb: "Wantirna",
    rating: 5,
    quote:
      "Our go-to for family nights in. Pickup is quick and the pasta portions are huge.",
    date: "2024",
  },
  {
    name: "Daniel R.",
    suburb: "Scoresby",
    rating: 4,
    quote:
      "Solid flavours, fair prices, and they're honest about wait times when it's busy — appreciate that.",
    date: "2024",
  },
  {
    name: "Emma W.",
    suburb: "Rowville",
    rating: 5,
    quote:
      "Hosted a birthday with their catering packages — stress-free and everyone left full.",
    date: "2024",
  },
];

export const reviewsHero = {
  eyebrow: "Reviews",
  title: "What Our Neighbours Say",
  subtitle: "Real feedback from locals who order pickup, delivery, and catering from Benny Boy's.",
};
