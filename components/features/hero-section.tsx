import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media-url";

const DEFAULT_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvLbch0jQ5PYw35jNjOwWrBuRd7eU_GlrTVGHvtPk_llIBerZFSgY2-RGO1dkxZpRa0FX5hKSYfkpRZWQRQksuFZZNgBNXgziC80aEEXAonKXkXEUYm4mwhAe2yXLjnYzXeQco1l4G3bHIp2nG1Qx7a-toviugVlrlrKmuQ3TJCB6mWpuKtKNdc6U62q70HyfIP3rarjnJI9-VWRee5BI3XwPb_CVeEzmfQrbaLax7OCoHPN4g82XSYhXqCFl6xZSnspMSAzb2QnU";

interface HeroSectionProps {
  onOpenCart: () => void;
  brandName?: string;
  tagline?: string;
  heroImageUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function HeroSection({
  onOpenCart,
  brandName,
  tagline,
  heroImageUrl,
  primaryColor,
  secondaryColor,
}: HeroSectionProps): React.ReactElement {
  const isBunnyBoys = brandName === "Bunny Boys";
  const accent = secondaryColor?.trim() || primaryColor?.trim() || "#d81b60";
  const heroSrc = resolveMediaUrl(heroImageUrl) ?? DEFAULT_HERO;

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden px-margin-mobile transition-colors duration-150 ease-out md:px-margin-desktop">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full scale-105 object-cover opacity-60"
          src={heroSrc}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent transition-colors duration-150 ease-out dark:from-black dark:via-black/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max">
        <div className="max-w-2xl space-y-8">
          <h1 className="font-display text-headline-xl leading-none tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
            {isBunnyBoys ? (
              <>
                BUNNY <br />
                BOYS <span style={{ color: accent }}>DELIVERED.</span>
              </>
            ) : (
              <>
                PIZZA & <br />
                PASTA <span style={{ color: accent }}>REFINED.</span>
              </>
            )}
          </h1>
          <p className="max-w-lg text-body-lg text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
            {tagline ??
              "Artisanal sourdough foundations, heritage recipes, and contemporary culinary precision delivered to your urban doorstep."}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="uppercase tracking-[0.15em]" onClick={onOpenCart}>
              Order Online
            </Button>
            <Button asChild className="uppercase tracking-[0.15em]" variant="outline">
              <Link href="/deals">View Specials</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
