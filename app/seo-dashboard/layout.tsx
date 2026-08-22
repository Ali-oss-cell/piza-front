import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Dashboard",
  robots: { index: false, follow: false },
};

export default function SeoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
