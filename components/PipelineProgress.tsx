"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineStatusResponse, PipelinePhase, PhaseStatus } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PipelineProgressProps {
  status: PipelineStatusResponse;
}

const phaseLabels: Record<PipelinePhase, string> = {
  discovery: "🔍 Finding Contacts",
  research: "🔬 Researching Companies",
  composition: "✉️ Creating Email Sequences",
};

const phaseIcons: Record<PhaseStatus, string> = {
  pending: "⏳",
  in_progress: "🔄",
  completed: "✅",
  failed: "❌",
};

export function PipelineProgress({ status }: PipelineProgressProps) {
  const phases: PipelinePhase[] = ["discovery", "research", "composition"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.status === "completed" ? (
            <span className="text-green-600">🎉 Pipeline Complete!</span>
          ) : status.status === "failed" ? (
            <span className="text-red-600">❌ Pipeline Failed</span>
          ) : (
            <span className="text-blue-600">
              🔄 Running: {phaseLabels[status.phase]}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase Progress Bars */}
        <div className="space-y-4">
          {phases.map((phase) => {
            const phaseProgress = status.progress[phase];
            const percent =
              phaseProgress.total > 0
                ? Math.round(
                    (phaseProgress.completed / phaseProgress.total) * 100
                  )
                : 0;

            return (
              <div key={phase} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        phaseProgress.status === "in_progress"
                          ? "animate-spin"
                          : ""
                      }
                    >
                      {phaseIcons[phaseProgress.status]}
                    </span>
                    {phaseLabels[phase]}
                  </span>
                  <span className="text-gray-600">
                    {phaseProgress.completed}/{phaseProgress.total}
                    {phaseProgress.failed > 0 && (
                      <span className="text-red-500 ml-2">
                        ({phaseProgress.failed} failed)
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      phaseProgress.status === "completed"
                        ? "bg-green-500"
                        : phaseProgress.status === "in_progress"
                        ? "bg-blue-500"
                        : phaseProgress.status === "failed"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{status.error}</p>
          </div>
        )}

        {/* Summary when complete */}
        {status.summary && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">
              🎉 Pipeline Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Contacts Discovered:</span>
                <span className="font-medium">
                  {status.summary.contacts_discovered}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contacts Researched:</span>
                <span className="font-medium">
                  {status.summary.contacts_researched}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sequences Created:</span>
                <span className="font-medium">
                  {status.summary.sequences_created}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emails Scheduled:</span>
                <span className="font-medium">
                  {status.summary.total_emails_scheduled}
                </span>
              </div>
            </div>

            {status.campaign_id && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <Link href={`/campaigns/${status.campaign_id}`}>
                  <Button className="w-full">
                    📊 View Campaign Details & Analytics
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Link to campaign while in progress */}
        {status.status !== "completed" && status.campaign_id && (
          <div className="text-center">
            <Link
              href={`/campaigns/${status.campaign_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View campaign progress →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
