"use client";

import { Input } from "@/components/ui/input";
import {
  coerceOpeningHours,
  DISPLAY_WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  type DayHours,
  type OpeningHoursConfig,
  type WeekdayKey,
} from "@/lib/opening-hours";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface OpeningHoursEditorProps {
  value: OpeningHoursConfig;
  onChange: (next: OpeningHoursConfig) => void;
}

function updateDay(
  config: OpeningHoursConfig,
  key: WeekdayKey,
  day: DayHours | null,
): OpeningHoursConfig {
  return {
    ...config,
    days: {
      ...config.days,
      [key]: day,
    },
  };
}

export function OpeningHoursEditor({
  value,
  onChange,
}: OpeningHoursEditorProps): React.ReactElement {
  const config = coerceOpeningHours(value);

  return (
    <div className="space-y-4">
      <div>
        <h3 className={cn("font-display text-lg font-bold", primaryText)}>Opening hours</h3>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Choose which days the store is open and set open / close times. Used on the website and
          for online order time slots.
        </p>
      </div>

      <div className="space-y-2">
        {DISPLAY_WEEKDAY_KEYS.map((key) => {
          const day = config.days[key];
          const isOpen = day !== null;

          return (
            <div
              className="flex flex-col gap-3 rounded-xl border border-zinc-200/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
              key={key}
            >
              <label className="flex min-w-[9rem] items-center gap-3">
                <input
                  checked={isOpen}
                  className="h-4 w-4 accent-[#d81b60]"
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange(
                        updateDay(config, key, {
                          open: day?.open ?? "17:00",
                          close: day?.close ?? "23:00",
                        }),
                      );
                    } else {
                      onChange(updateDay(config, key, null));
                    }
                  }}
                  type="checkbox"
                />
                <span className={cn("text-sm font-medium", primaryText)}>
                  {WEEKDAY_LABELS[key]}
                </span>
              </label>

              {isOpen && day ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    aria-label={`${WEEKDAY_LABELS[key]} open`}
                    className="w-[8.5rem]"
                    onChange={(event) =>
                      onChange(
                        updateDay(config, key, {
                          ...day,
                          open: event.target.value,
                        }),
                      )
                    }
                    type="time"
                    value={day.open}
                  />
                  <span className={cn("text-sm", secondaryText)}>to</span>
                  <Input
                    aria-label={`${WEEKDAY_LABELS[key]} close`}
                    className="w-[8.5rem]"
                    onChange={(event) =>
                      onChange(
                        updateDay(config, key, {
                          ...day,
                          close: event.target.value,
                        }),
                      )
                    }
                    type="time"
                    value={day.close}
                  />
                </div>
              ) : (
                <span className={cn("text-sm", secondaryText)}>Closed</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
            Order lead time (minutes)
          </label>
          <Input
            min={0}
            onChange={(event) =>
              onChange({
                ...config,
                leadTimeMinutes: Number(event.target.value) || 0,
              })
            }
            type="number"
            value={config.leadTimeMinutes}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
            Slot interval (minutes)
          </label>
          <Input
            min={5}
            onChange={(event) =>
              onChange({
                ...config,
                slotIntervalMinutes: Number(event.target.value) || 15,
              })
            }
            step={5}
            type="number"
            value={config.slotIntervalMinutes}
          />
        </div>
      </div>
    </div>
  );
}
