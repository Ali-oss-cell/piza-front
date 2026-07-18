export interface DayHours {
  open: string;
  close: string;
}

export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface OpeningHoursConfig {
  timezone: string;
  leadTimeMinutes: number;
  slotIntervalMinutes: number;
  days: Record<WeekdayKey, DayHours | null>;
}

export interface TimeSlot {
  value: string;
  label: string;
}

/** Display order Mon → Sun for admin / footer. */
export const DISPLAY_WEEKDAY_KEYS: WeekdayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const WEEKDAY_SHORT: Record<WeekdayKey, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const DEFAULT_OPENING_HOURS: OpeningHoursConfig = {
  timezone: "Australia/Melbourne",
  leadTimeMinutes: 45,
  slotIntervalMinutes: 15,
  days: {
    monday: { open: "17:00", close: "23:00" },
    tuesday: { open: "17:00", close: "23:00" },
    wednesday: { open: "17:00", close: "23:00" },
    thursday: { open: "17:00", close: "23:00" },
    friday: { open: "17:00", close: "23:00" },
    saturday: { open: "12:00", close: "23:59" },
    sunday: { open: "12:00", close: "23:59" },
  },
};

export function parseOpeningHours(value: unknown): OpeningHoursConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const config = value as Partial<OpeningHoursConfig>;

  if (
    typeof config.timezone !== "string" ||
    typeof config.leadTimeMinutes !== "number" ||
    typeof config.slotIntervalMinutes !== "number" ||
    !config.days
  ) {
    return null;
  }

  return config as OpeningHoursConfig;
}

export function coerceOpeningHours(value: unknown): OpeningHoursConfig {
  return parseOpeningHours(value) ?? structuredClone(DEFAULT_OPENING_HOURS);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatClock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (h === 0 && m === 0) {
    return "12am";
  }
  if (h === 23 && m === 59) {
    return "12am";
  }
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

function dayKey(day: DayHours | null): string {
  if (!day) {
    return "closed";
  }
  return `${day.open}-${day.close}`;
}

/** Compact lines like "Mon — Fri: 5pm – 11pm". */
export function formatOpeningHoursLines(openingHours: unknown): string[] {
  const config = parseOpeningHours(openingHours);
  if (!config) {
    return [];
  }

  const lines: string[] = [];
  let i = 0;
  while (i < DISPLAY_WEEKDAY_KEYS.length) {
    const startKey = DISPLAY_WEEKDAY_KEYS[i];
    const startDay = config.days[startKey];
    let j = i + 1;
    while (
      j < DISPLAY_WEEKDAY_KEYS.length &&
      dayKey(config.days[DISPLAY_WEEKDAY_KEYS[j]]) === dayKey(startDay)
    ) {
      j += 1;
    }

    const endKey = DISPLAY_WEEKDAY_KEYS[j - 1];
    const dayLabel =
      startKey === endKey
        ? WEEKDAY_SHORT[startKey]
        : `${WEEKDAY_SHORT[startKey]} — ${WEEKDAY_SHORT[endKey]}`;

    if (!startDay) {
      lines.push(`${dayLabel}: Closed`);
    } else {
      lines.push(
        `${dayLabel}: ${formatClock(startDay.open)} – ${formatClock(startDay.close)}`,
      );
    }
    i = j;
  }

  return lines;
}

function weekdayKeyFromDate(date: Date, timezone: string): WeekdayKey {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  })
    .format(date)
    .toLowerCase() as WeekdayKey;
}

function zonedDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  const displayed = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
  );

  const offset = displayed - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}

function formatSlotLabel(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function buildTimeSlots(
  openingHours: unknown,
  daysAhead = 7,
): TimeSlot[] {
  const config = parseOpeningHours(openingHours);

  if (!config) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const now = new Date();
  const earliest = new Date(now.getTime() + config.leadTimeMinutes * 60_000);
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
    const dayBase = new Date(now.getTime() + dayOffset * 24 * 60 * 60_000);
    const parts = formatter.formatToParts(dayBase);
    const lookup = Object.fromEntries(
      parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    );
    const year = Number(lookup.year);
    const month = Number(lookup.month);
    const day = Number(lookup.day);
    const weekday = weekdayKeyFromDate(dayBase, config.timezone);
    const dayHours = config.days[weekday];

    if (!dayHours) {
      continue;
    }

    const openMinutes = parseTimeToMinutes(dayHours.open);
    const closeMinutes = parseTimeToMinutes(dayHours.close);

    for (
      let minutes = openMinutes;
      minutes <= closeMinutes;
      minutes += config.slotIntervalMinutes
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const slotDate = zonedDateTime(year, month, day, hour, minute, config.timezone);

      if (slotDate.getTime() < earliest.getTime()) {
        continue;
      }

      slots.push({
        value: slotDate.toISOString(),
        label: formatSlotLabel(slotDate, config.timezone),
      });
    }
  }

  return slots;
}

export function formatScheduledAt(value: string, timezone = "Australia/Melbourne"): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}
