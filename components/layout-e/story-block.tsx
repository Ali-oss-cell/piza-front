"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  cinematicTransition,
  prefersReducedMotion,
} from "@/lib/layout-e/motion-tokens";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function StoryBlock({
  title,
  body,
  imageUrl,
  imageAlt,
  reverse,
}: {
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  reverse: boolean;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !imageWrapRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageWrapRef.current,
        { clipPath: "inset(12% 12% 12% 12% round 2px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 2px)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 28%",
            scrub: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className={cn(
        "grid items-center gap-8 px-margin-mobile py-16 md:gap-12 md:px-margin-desktop md:py-36 lg:grid-cols-2",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
      ref={sectionRef}
    >
      <div
        className="relative h-[60vh] overflow-hidden rounded-sm bg-zinc-900 md:h-[80vh]"
        ref={imageWrapRef}
        style={
          reduceMotion
            ? undefined
            : { clipPath: "inset(12% 12% 12% 12% round 2px)" }
        }
      >
        <Image
          alt={imageAlt}
          className="object-cover brightness-[0.9] contrast-[1.05] saturate-[0.9]"
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          src={imageUrl}
        />
      </div>
      <motion.div
        className="max-w-md"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        transition={cinematicTransition}
        viewport={{ once: true, amount: 0.35 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg md:leading-[1.7]">
          {body}
        </p>
      </motion.div>
    </section>
  );
}
