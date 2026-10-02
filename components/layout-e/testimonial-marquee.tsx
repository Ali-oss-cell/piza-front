"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/layout-e/motion-tokens";

export function TestimonialMarquee({
  quotes,
}: {
  quotes: string[];
}): React.ReactElement {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (!emblaApi.canScrollNext()) {
        emblaApi.scrollTo(0);
      } else {
        emblaApi.scrollNext();
      }
    }, 3200);
    return () => window.clearInterval(id);
  }, [emblaApi]);

  const slides = [...quotes, ...quotes];

  return (
    <section className="overflow-hidden py-16 md:py-24">
      <div className="cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-10 px-8 md:gap-16">
          {slides.map((quote, index) => (
            <p
              className="max-w-md shrink-0 font-display text-2xl font-medium text-white/70 md:max-w-lg md:text-3xl"
              key={`${quote}-${index}`}
            >
              “{quote}”
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
