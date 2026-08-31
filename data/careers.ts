export interface JobOpening {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string[];
}

export const careersHero = {
  eyebrow: "Careers",
  title: "Join the Benny Boy's Team",
  subtitle:
    "We're a neighbourhood pizza shop built on good food and good people. If you love a fast-paced kitchen or friendly counter, we'd like to hear from you.",
};

export const jobOpenings: JobOpening[] = [
  {
    id: "pizza-chef",
    title: "Pizza Chef / Kitchen Hand",
    type: "Part-time & casual",
    description:
      "Help prep, stretch dough, and send out consistent pizzas during busy service. Experience preferred but we train the right attitude.",
    requirements: [
      "Food safety awareness",
      "Available evenings and weekends",
      "Reliable and team-focused",
    ],
  },
  {
    id: "delivery-driver",
    title: "Delivery Driver",
    type: "Casual",
    description:
      "Deliver orders safely and with a smile across our local delivery zone. Must have a valid licence and your own insured vehicle.",
    requirements: [
      "Valid driver's licence",
      "Smartphone for navigation",
      "Evening availability",
    ],
  },
  {
    id: "counter-staff",
    title: "Counter / Customer Service",
    type: "Part-time",
    description:
      "Take phone and walk-in orders, keep the front running smoothly, and make every customer feel welcome.",
    requirements: [
      "Clear communication",
      "Comfortable handling cash and cards",
      "Flexible shifts",
    ],
  },
];
