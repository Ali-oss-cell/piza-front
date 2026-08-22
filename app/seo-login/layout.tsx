import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Login",
  robots: { index: false, follow: false },
};

export default function SeoLoginLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
