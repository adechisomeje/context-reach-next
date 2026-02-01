"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DurationConfig } from "@/lib/types";
import { useCreditCalculator } from "@/hooks/useCreditCalculator";

interface DurationConfigFormProps {
  maxContacts: number;
  enrichCredits: number;
  userCredits: number;
  userCreditsLoading?: boolean;
  onChange: (config: DurationConfig | null) => void;
}

export function DurationConfigForm({
  maxContacts,
  enrichCredits,
  userCredits,
  userCreditsLoading = false,
  onChange,
}: DurationConfigFormProps) {
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [durationDays, setDurationDays] = useState(5);
  const [preferredHour, setPreferredHour] = useState(9);

  // Calculate credits - contacts_per_day is always maxContacts
  const { creditsPerDay, totalCredits } = useCreditCalculator(
    maxContacts,
    enrichCredits,
    isMultiDay ? durationDays : 1
  );

  const hasEnoughCredits = userCredits >= totalCredits;

  // Update parent when config changes
  useEffect(() => {
    if (isMultiDay) {
      onChange({
        duration_days: durationDays,
        preferred_run_hour: preferredHour,
      });
    } else {
      onChange(null);
    }
  }, [isMultiDay, durationDays, preferredHour, onChange]);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  return (
    <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <h4 className="font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        📅 Campaign Duration
      </h4>

      {/* Toggle */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="duration"
            checked={!isMultiDay}
            onChange={() => setIsMultiDay(false)}
            className="w-4 h-4 text-slate-900 dark:text-white focus:ring-slate-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Single Day (run once)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="duration"
            checked={isMultiDay}
            onChange={() => setIsMultiDay(true)}
            className="w-4 h-4 text-slate-900 dark:text-white focus:ring-slate-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Multi-Day Campaign
          </span>
        </label>
      </div>

      {/* Multi-day options */}
      {isMultiDay && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Duration
              </label>
              <Select
                value={durationDays.toString()}
                onValueChange={(v) => setDurationDays(parseInt(v))}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 19 }, (_, i) => i + 2).map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} workdays
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Run Time
              </label>
              <Select
                value={preferredHour.toString()}
                onValueChange={(v) => setPreferredHour(parseInt(v))}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {formatHour(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts per day info */}
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            ℹ️ Will discover <span className="font-medium">{maxContacts}</span> contacts each day
          </p>
        </>
      )}

      {/* Credit summary */}
      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="text-sm space-y-1">
          {isMultiDay && (
            <p className="text-slate-600 dark:text-slate-400">
              Per Day:{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {creditsPerDay} credits
              </span>{" "}
              ({maxContacts} discover + {enrichCredits} enrich)
            </p>
          )}
          <p className="font-medium text-slate-900 dark:text-white">
            Total:{" "}
            <span className="text-lg">{totalCredits} credits</span>
            {isMultiDay && (
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                {" "}
                ({durationDays} days × {creditsPerDay})
              </span>
            )}
          </p>
          <p
            className={`flex items-center gap-1 ${
              userCreditsLoading
                ? "text-slate-500 dark:text-slate-400"
                : hasEnoughCredits
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            Your Balance:{" "}
            {userCreditsLoading ? (
              <span className="inline-flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              <>
                {userCredits} credits{" "}
                {hasEnoughCredits ? (
                  <span className="text-green-500">✅</span>
                ) : (
                  <span className="text-red-500">❌ Insufficient</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Multi-day info */}
      {isMultiDay && (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💡</span>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Multi-day campaigns:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Run on workdays only (Mon-Fri)</li>
                <li>Credits reserved upfront, refunded on cancel</li>
                <li>Can pause/resume anytime</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
