import { generalImages, pastaImages, pizzaImages } from "@/data/images";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export const galleryImages: GalleryImage[] = [
  ...pizzaImages.map((img, i) => ({
    src: img.imageUrl,
    alt: img.imageAlt,
    caption: i === 0 ? "Fresh from the oven" : undefined,
  })),
  ...pastaImages.map((img) => ({ src: img.imageUrl, alt: img.imageAlt })),
  ...generalImages.map((img) => ({ src: img.imageUrl, alt: img.imageAlt })),
];

export const galleryHero = {
  eyebrow: "Gallery",
  title: "Food Worth Showing Off",
  subtitle: "Pizza, pasta, sides, and the moments we share with our Wantirna South community.",
};
