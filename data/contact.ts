import { Mail, MapPin, Phone } from "lucide-react";
import { BENNY_BOYS_ADDRESS } from "@/types/brand";

export const contactHero = {
  eyebrow: "Contact",
  title: "We'd Love to Hear From You",
  subtitle:
    "Questions about an order, catering, careers, or anything else — send a message or reach us directly.",
};

export const contactChannels = [
  {
    title: "Visit us",
    detail: BENNY_BOYS_ADDRESS,
    icon: MapPin,
    href: "/locations",
  },
  {
    title: "Call",
    detail: "Phone listed on our Locations page",
    icon: Phone,
    href: "/locations",
  },
  {
    title: "Email",
    detail: "Use the form — we reply within one business day",
    icon: Mail,
    href: "#contact-form",
  },
];
