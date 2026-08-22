/** Use on interactive elements only (hover/focus), not for theme surfaces. */
export const themeTransition = "transition-colors duration-150 ease-out";

export const pageShell =
  "bg-[color:var(--brand-bg-light,#ffffff)] text-zinc-950 dark:bg-[color:var(--brand-bg-dark,#000000)] dark:text-white";

export const glassPanel =
  "border backdrop-blur-md bg-white/70 border-zinc-200/50 dark:bg-zinc-900/50 dark:border-white/10";

export const headerShell =
  "border-b backdrop-blur-md bg-white/85 border-zinc-200/60 text-zinc-950 dark:bg-black/85 dark:border-white/10 dark:text-white";

export const primaryText = "text-zinc-950 dark:text-zinc-50";

export const secondaryText = "text-zinc-500 dark:text-zinc-400";

export const mutedText = secondaryText;

export const cardShell =
  "rounded-2xl border backdrop-blur-md bg-white/80 border-zinc-200/70 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:shadow-lg dark:bg-zinc-900/40 dark:border-zinc-800/60";

export const brandAccent = "text-[color:var(--brand-accent,#d81b60)]";
export const brandAccentBg = "bg-[color:var(--brand-accent,#d81b60)]";
export const brandAccentBorder = "border-[color:var(--brand-accent,#d81b60)]";

/** @deprecated use brandAccent */
export const brandPink = brandAccent;
/** @deprecated use brandAccentBg */
export const brandPinkBg = brandAccentBg;

export const panelBg =
  "bg-zinc-50 dark:bg-[color:var(--brand-bg-dark,#000000)]";

export const panelInset = "bg-white dark:bg-zinc-950";

export const panelFooter = "bg-white dark:bg-zinc-950";

export const navLink =
  "text-zinc-600 transition-colors duration-150 ease-out hover:text-[color:var(--brand-accent,#d81b60)] dark:text-zinc-400 dark:hover:text-[color:var(--brand-accent,#d81b60)]";

export const dashboardGlass =
  "rounded-2xl border border-zinc-200/50 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/40";
