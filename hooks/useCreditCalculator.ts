"use client";

import { useMemo } from "react";

interface CreditCalculation {
  creditsPerDay: number;
  totalCredits: number;
  breakdown: {
    discovery: number;
    enrichment: number;
  };
}

export function useCreditCalculator(
  contactsPerDay: number,
  enrichCredits: number,
  durationDays: number
): CreditCalculation {
  return useMemo(() => {
    const creditsPerDay = contactsPerDay + enrichCredits;
    const totalCredits = creditsPerDay * durationDays;

    return {
      creditsPerDay,
      totalCredits,
      breakdown: {
        discovery: contactsPerDay * durationDays,
        enrichment: enrichCredits * durationDays,
      },
    };
  }, [contactsPerDay, enrichCredits, durationDays]);
}
