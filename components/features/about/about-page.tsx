import { AboutCta } from "@/components/features/about/about-cta";
import { AboutHero } from "@/components/features/about/about-hero";
import { AboutPillars } from "@/components/features/about/about-pillars";
import { AboutProcess } from "@/components/features/about/about-process";
import { AboutStory } from "@/components/features/about/about-story";
import { SiteFooter } from "@/components/features/site-footer";

export function AboutPage(): React.ReactElement {
  return (
    <>
      <main className="bg-white text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white">
        <AboutHero />
        <AboutStory />
        <AboutPillars />
        <AboutProcess />
        <AboutCta />
      </main>
      <SiteFooter />
    </>
  );
}
