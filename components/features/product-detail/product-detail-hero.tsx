import Image from "next/image";
import { MenuItemBadges } from "@/components/features/menu-item-badges";
import type { MenuItem } from "@/types/menu";

interface ProductDetailHeroProps {
  item: MenuItem;
}

export function ProductDetailHero({ item }: ProductDetailHeroProps): React.ReactElement {
  return (
    <div className="relative md:sticky md:top-24 md:self-start">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-100 transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900">
        <Image
          alt={item.imageAlt}
          className="h-full w-full object-cover"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          src={item.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent transition-colors duration-150 ease-out dark:from-black/50" />
      </div>

      {item.badges?.length ? (
        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)]">
          <MenuItemBadges badges={item.badges} size="md" />
        </div>
      ) : null}

      <div className="absolute bottom-4 left-4 rounded-full border border-zinc-200/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-950 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40 dark:text-white">
        #{item.number}
      </div>
    </div>
  );
}
