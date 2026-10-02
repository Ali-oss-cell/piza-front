"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  cinematicStagger,
  cinematicTransition,
  prefersReducedMotion,
} from "@/lib/layout-e/motion-tokens";
import { resolveMediaUrl } from "@/lib/media-url";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioHero({
  brandName,
  headline,
  imageUrl,
}: {
  brandName?: string;
  headline: string;
  imageUrl: string;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const words = headline.split(/\s+/).filter(Boolean);
  const src = resolveMediaUrl(imageUrl) ?? imageUrl;

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !contentRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        scale: 0.88,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=70%",
          pin: true,
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 md:pb-24"
      ref={sectionRef}
    >
      <div className="absolute inset-0">
        <Image
          alt=""
          className="object-cover brightness-[0.55] contrast-[1.08] saturate-[0.85]"
          fill
          priority
          sizes="100vw"
          src={src}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
      </div>
      <div
        className="relative z-[1] mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop"
        ref={contentRef}
      >
        <motion.p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={cinematicTransition}
        >
          {brandName}
        </motion.p>
        <h1 className="max-w-4xl font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[72px] lg:text-[88px]">
          {words.map((word, index) => (
            <motion.span
              className="mr-[0.28em] inline-block"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              key={`${word}-${index}`}
              transition={{
                ...cinematicTransition,
                delay: reduceMotion ? 0 : index * cinematicStagger,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.div
          className="mt-8"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...cinematicTransition, delay: reduceMotion ? 0 : 0.35 }}
        >
          <Button
            asChild
            className="rounded-full border border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
            variant="outline"
          >
            <Link href="/menu">Explore the menu</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
