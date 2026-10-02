"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  cinematicTransition,
  prefersReducedMotion,
} from "@/lib/layout-e/motion-tokens";
import { resolveMediaUrl } from "@/lib/media-url";

gsap.registerPlugin(ScrollTrigger);

export function ClosingCta({
  imageUrl,
}: {
  imageUrl: string;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const src = resolveMediaUrl(imageUrl) ?? imageUrl;

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !contentRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.92, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=45%",
            pin: true,
            scrub: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden md:min-h-[80vh]"
      ref={sectionRef}
    >
      <div className="absolute inset-0">
        <Image
          alt=""
          className="object-cover brightness-[0.4] contrast-[1.05]"
          fill
          sizes="100vw"
          src={src}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />
      </div>
      <div className="relative z-[1] px-6 text-center" ref={contentRef}>
        <motion.h2
          className="font-display text-4xl font-bold md:text-6xl lg:text-7xl"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          transition={cinematicTransition}
          viewport={{ once: true, amount: 0.5 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Hungry yet?
        </motion.h2>
        <motion.div
          className="mt-8"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          transition={{ ...cinematicTransition, delay: 0.12 }}
          viewport={{ once: true, amount: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <Button asChild className="rounded-full px-10" size="lg" variant="pill">
            <Link href="/menu">Order now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
