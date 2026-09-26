import type { OpeningHoursConfig, WeekdayKey } from "@/lib/opening-hours";
import {
  DISPLAY_WEEKDAY_KEYS,
  formatOpeningHoursLines,
  parseOpeningHours,
} from "@/lib/opening-hours";
import type { TradingHours } from "@/types/location";

/** Build tel: href from free-form AU phone text. Returns null if empty. */
export function toTelHref(phone: string | null | undefined): string | null {
  const raw = phone?.trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("0")) return `tel:+61${digits.slice(1)}`;
  return `tel:${digits}`;
}

export function displayPhone(phone: string | null | undefined): string | null {
  const raw = phone?.trim();
  return raw || null;
}

/** Prefer structured opening hours; never invent a fake Mon–Sun 5–10 line. */
export function resolveHourLines(openingHours: unknown): string[] {
  return formatOpeningHoursLines(openingHours);
}

export function tradingHoursFromOpeningHours(openingHours: unknown): TradingHours[] {
  const lines = formatOpeningHoursLines(openingHours);
  return lines.map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) {
      return { label: line, hours: "" };
    }
    return {
      label: line.slice(0, idx).trim(),
      hours: line.slice(idx + 1).trim(),
    };
  });
}

const SCHEMA_DAY: Record<WeekdayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function openingHoursSpecification(openingHours: unknown): Array<{
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}> {
  const config = parseOpeningHours(openingHours);
  if (!config) return [];

  const specs: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }> = [];

  let i = 0;
  while (i < DISPLAY_WEEKDAY_KEYS.length) {
    const startKey = DISPLAY_WEEKDAY_KEYS[i];
    const startDay = config.days[startKey];
    if (!startDay) {
      i += 1;
      continue;
    }
    let j = i + 1;
    while (
      j < DISPLAY_WEEKDAY_KEYS.length &&
      config.days[DISPLAY_WEEKDAY_KEYS[j]]?.open === startDay.open &&
      config.days[DISPLAY_WEEKDAY_KEYS[j]]?.close === startDay.close
    ) {
      j += 1;
    }
    const days = DISPLAY_WEEKDAY_KEYS.slice(i, j).map((key) => SCHEMA_DAY[key]);
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.length === 1 ? days[0] : days,
      opens: startDay.open,
      closes: startDay.close === "23:59" ? "00:00" : startDay.close,
    });
    i = j;
  }

  return specs;
}

/** Best-effort AU address parse for PostalAddress schema. */
export function parseAustralianAddress(address: string | null | undefined): {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
} | null {
  const raw = address?.trim();
  if (!raw) return null;

  const country = "AU";
  const cleaned = raw.replace(/,?\s*Australia\s*$/i, "").trim();
  const match = cleaned.match(
    /^(.+?),\s*([^,]+?)\s+(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})\s*$/i
  );
  if (match) {
    return {
      streetAddress: match[1].trim(),
      addressLocality: match[2].trim(),
      addressRegion: match[3].toUpperCase(),
      postalCode: match[4],
      addressCountry: country,
    };
  }

  return {
    streetAddress: cleaned,
    addressCountry: country,
  };
}

export function suburbFromAddress(address: string | null | undefined): string | null {
  const parsed = parseAustralianAddress(address);
  return parsed?.addressLocality ?? null;
}

export function formatLocalPageTitle(
  pageLabel: string,
  storeName: string,
  suburb: string | null
): string {
  if (suburb) {
    return `${pageLabel} ${suburb} | ${storeName}`;
  }
  return `${pageLabel} | ${storeName}`;
}

export function formatLocalPageDescription(
  template: string,
  storeName: string,
  suburb: string | null
): string {
  return template
    .replace(/\{storeName\}/g, storeName)
    .replace(/\{suburb\}/g, suburb ?? "your area");
}

// Re-export for convenience in schema builders
export type { OpeningHoursConfig };
