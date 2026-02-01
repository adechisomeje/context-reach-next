"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DailyRun, DailyRunStatus } from "@/lib/types";

interface DailyRunsTableProps {
  dailyRuns: DailyRun[];
}

export function DailyRunsTable({ dailyRuns }: DailyRunsTableProps) {
  const getStatusBadge = (status: DailyRunStatus) => {
    const variants: Record<DailyRunStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: string; label: string }> = {
      pending: { variant: "outline", icon: "⏳", label: "Pending" },
      scheduled: { variant: "secondary", icon: "📅", label: "Scheduled" },
      running: { variant: "default", icon: "🔄", label: "Running" },
      completed: { variant: "default", icon: "✅", label: "Completed" },
      failed: { variant: "destructive", icon: "❌", label: "Failed" },
      skipped: { variant: "outline", icon: "⏭️", label: "Skipped" },
    };
    const v = variants[status] || variants.pending;
    
    return (
      <Badge
        variant={v.variant}
        className={`${
          status === "completed"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : status === "running"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse"
              : ""
        }`}
      >
        {v.icon} {v.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <h3 className="font-medium text-slate-900 dark:text-white">Daily Run History</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
            <TableHead className="w-16">Day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Contacts</TableHead>
            <TableHead className="text-right">Sequences</TableHead>
            <TableHead className="text-right">Credits</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dailyRuns.map((run) => (
            <TableRow key={run.day_number}>
              <TableCell className="font-medium">{run.day_number}</TableCell>
              <TableCell>{getStatusBadge(run.status)}</TableCell>
              <TableCell className="text-right">
                {run.contacts_discovered > 0 ? run.contacts_discovered : "-"}
              </TableCell>
              <TableCell className="text-right">
                {run.sequences_created > 0 ? run.sequences_created : "-"}
              </TableCell>
              <TableCell className="text-right">
                {run.credits_used > 0 ? run.credits_used : "-"}
              </TableCell>
              <TableCell>
                {run.completed_at
                  ? formatDateTime(run.completed_at)
                  : run.status === "running"
                    ? <span className="text-blue-600 dark:text-blue-400">Running...</span>
                    : run.scheduled_at
                      ? formatDateTime(run.scheduled_at)
                      : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
