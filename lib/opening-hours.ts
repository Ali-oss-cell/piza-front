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

const WEEKDAY_KEYS: WeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseOpeningHours(value: unknown): OpeningHoursConfig | null {
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

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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
