import { Montserrat } from "next/font/google";

/** Secondary — body copy, labels, UI */
export const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Main — headlines, logo, display type (TG Praktikal Variable via @font-face in globals.css) */
export const praktikalFamily = "TG Praktikal";
