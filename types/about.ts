import type { LucideIcon } from "lucide-react";

export interface CraftPillar {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}
