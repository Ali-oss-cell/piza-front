export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const privacySections: LegalSection[] = [
  {
    title: "Information we collect",
    paragraphs: [
      "When you order online we collect your name, contact details, delivery address, and order history so we can fulfil your order and improve your experience.",
      "We may also collect anonymous analytics about how you use our website to help us improve the menu and checkout flow.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "We use your details to process orders, send order confirmations, respond to enquiries, and — with your consent — share occasional offers relevant to Benny Boy's.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    title: "Payment security",
    paragraphs: [
      "Card payments are processed securely through our payment provider. We do not store full card numbers on our servers.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Questions about privacy? Reach us via the Contact page or call the store directly.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "Ordering",
    paragraphs: [
      "By placing an order you agree to provide accurate contact and delivery information. Prices shown include GST unless stated otherwise.",
      "We reserve the right to refuse or cancel orders in cases of error, unavailability, or suspected fraud.",
    ],
  },
  {
    title: "Delivery & pickup",
    paragraphs: [
      "Estimated times are guides only — busy periods may cause delays. Risk of loss passes to you on delivery or pickup collection.",
      "Please inspect your order on receipt and contact us promptly if anything is missing or incorrect.",
    ],
  },
  {
    title: "Allergens & dietary",
    paragraphs: [
      "Our kitchen handles gluten, dairy, nuts, and other allergens. While we take care, we cannot guarantee allergen-free preparation. See our Allergens page for more detail.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by Australian Consumer Law, our liability for any claim relating to an order is limited to the value of that order.",
    ],
  },
];
