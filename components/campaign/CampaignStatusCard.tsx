"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CampaignStatusResponse, CampaignAction } from "@/lib/types";
import { useCampaignActions } from "@/hooks/useOrchestration";

interface CampaignStatusCardProps {
  campaign: CampaignStatusResponse;
  onUpdate: () => void;
}

export function CampaignStatusCard({ campaign, onUpdate }: CampaignStatusCardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { pauseCampaign, resumeCampaign, cancelCampaign, loading, error } = useCampaignActions();

  const progress = (campaign.current_day / campaign.duration_days) * 100;
  const creditsProgress = campaign.total_credits_reserved > 0
    ? (campaign.credits_consumed / campaign.total_credits_reserved) * 100
    : 0;

  const handleAction = async (action: CampaignAction) => {
    let result = null;
    switch (action) {
      case "pause":
        result = await pauseCampaign(campaign.campaign_id);
        break;
      case "resume":
        result = await resumeCampaign(campaign.campaign_id);
        break;
      case "cancel":
        result = await cancelCampaign(campaign.campaign_id);
        setShowCancelConfirm(false);
        break;
    }
    if (result) {
      onUpdate();
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500",
  };

  const getDayStatus = (dayNumber: number) => {
    const run = campaign.daily_runs?.find((r) => r.day_number === dayNumber);
    return run?.status || "pending";
  };

  const getDayIndicator = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-200", icon: "✅" };
      case "running":
        return { bg: "bg-blue-100 dark:bg-blue-900/30 animate-pulse", text: "text-blue-800 dark:text-blue-200", icon: "🔄" };
      case "failed":
        return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-200", icon: "❌" };
      case "skipped":
        return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", icon: "⏭️" };
      case "scheduled":
        return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: "📅" };
      default:
        return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: "⏳" };
    }
  };

  // Calculate refund amount for cancel confirmation
  const remainingDays = campaign.duration_days - campaign.current_day;
  const creditsPerDay = campaign.total_credits_reserved / campaign.duration_days;
  const estimatedRefund = Math.round(remainingDays * creditsPerDay);

  return (
    <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            📅 Multi-Day Campaign
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Day {campaign.current_day} of {campaign.duration_days}
          </p>
        </div>
        <Badge className={`${statusColors[campaign.status]} text-white`}>
          {campaign.status.toUpperCase()}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>Day {campaign.current_day}</span>
          <span>{Math.round(progress)}%</span>
          <span>Day {campaign.duration_days}</span>
        </div>
      </div>

      {/* Day indicators */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {Array.from({ length: campaign.duration_days }, (_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const { bg, text, icon } = getDayIndicator(status);

          return (
            <div
              key={day}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-center text-sm ${bg} ${text}`}
            >
              <div className="font-medium">Day {day}</div>
              <div className="text-lg">{icon}</div>
            </div>
          );
        })}
      </div>

      {/* Credits */}
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">💳 Credits Used</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {campaign.credits_consumed} / {campaign.total_credits_reserved}
          </span>
        </div>
        <Progress value={creditsProgress} className="h-2" />
      </div>

      {/* Next run */}
      {campaign.next_run_at && !campaign.is_paused && !campaign.is_cancelled && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            📍 Next Run:{" "}
            <span className="font-medium">
              {new Date(campaign.next_run_at).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </span>
        </div>
      )}

      {/* Paused message */}
      {campaign.is_paused && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            ⏸️ Campaign is paused. Click Resume to continue.
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Are you sure you want to cancel this campaign?
            {remainingDays > 0 && (
              <span className="block mt-1 font-medium">
                ~{estimatedRefund} credits will be refunded for {remainingDays} unused days.
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("cancel")}
              disabled={loading === "cancel"}
            >
              {loading === "cancel" ? "Cancelling..." : "Yes, Cancel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelConfirm(false)}
            >
              No, Keep Running
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {campaign.status === "active" && !showCancelConfirm && (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction("pause")}
              disabled={loading !== null}
              className="flex items-center gap-2"
            >
              {loading === "pause" ? (
                "Pausing..."
              ) : (
                <>
                  <span>⏸</span> Pause
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
              disabled={loading !== null}
              className="flex items-center gap-2"
            >
              <span>🛑</span> Cancel
            </Button>
          </>
        )}
        {campaign.status === "paused" && !showCancelConfirm && (
          <>
            <Button
              onClick={() => handleAction("resume")}
              disabled={loading !== null}
              className="flex items-center gap-2"
            >
              {loading === "resume" ? (
                "Resuming..."
              ) : (
                <>
                  <span>▶️</span> Resume
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
              disabled={loading !== null}
              className="flex items-center gap-2"
            >
              <span>🛑</span> Cancel
            </Button>
          </>
        )}
      </div>

      {/* Refund info for cancelled campaigns */}
      {campaign.is_cancelled && campaign.credits_refunded && campaign.credits_refunded > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <span className="text-sm text-green-700 dark:text-green-300">
            💰 {campaign.credits_refunded} credits have been refunded to your account.
          </span>
        </div>
      )}
    </Card>
  );
}
