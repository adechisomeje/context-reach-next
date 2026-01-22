"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CampaignAnalytics } from "@/lib/types";

interface CampaignAnalyticsDashboardProps {
  analytics: CampaignAnalytics | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignAnalyticsDashboard({
  analytics,
  loading,
}: CampaignAnalyticsDashboardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>Loading analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>
            No analytics available yet. Analytics will appear once emails are
            sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📊</span>
            <p>Start sending emails to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const openRate =
    analytics.delivered > 0
      ? ((analytics.opened / analytics.delivered) * 100).toFixed(1)
      : "0";

  const clickRate =
    analytics.opened > 0
      ? ((analytics.clicked / analytics.opened) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Emails Sent"
          value={analytics.total_sent}
          icon="📤"
        />
        <StatCard
          title="Delivered"
          value={analytics.delivered}
          subtitle={`${analytics.deliverability_rate.toFixed(1)}% deliverability`}
          icon="✅"
        />
        <StatCard
          title="Opened"
          value={analytics.opened}
          subtitle={`${openRate}% open rate`}
          icon="👀"
        />
        <StatCard
          title="Replied"
          value={analytics.replied}
          subtitle={`${analytics.reply_rate.toFixed(1)}% reply rate`}
          icon="💬"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <span className="font-medium">{analytics.delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Bounced</span>
                </div>
                <span className="font-medium">{analytics.bounced}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Clicked</span>
                </div>
                <span className="font-medium">
                  {analytics.clicked}
                  <span className="text-gray-400 text-sm ml-1">
                    ({clickRate}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${
                      analytics.total_sent > 0
                        ? (analytics.delivered / analytics.total_sent) * 100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${
                      analytics.total_sent > 0
                        ? (analytics.bounced / analytics.total_sent) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {analytics.deliverability_rate.toFixed(1)}% deliverability rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reply Sentiment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reply Sentiment</CardTitle>
            <CardDescription>
              {analytics.replied} total replies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.replied > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👍</span>
                    <span className="text-sm text-gray-600">Positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      {analytics.positive_replies}
                    </span>
                    <span className="text-xs text-gray-400">
                      (
                      {(
                        (analytics.positive_replies / analytics.replied) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👎</span>
                    <span className="text-sm text-gray-600">Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-600">
                      {analytics.negative_replies}
                    </span>
                    <span className="text-xs text-gray-400">
                      (
                      {(
                        (analytics.negative_replies / analytics.replied) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤷</span>
                    <span className="text-sm text-gray-600">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">
                      {analytics.neutral_replies}
                    </span>
                    <span className="text-xs text-gray-400">
                      (
                      {(
                        (analytics.neutral_replies / analytics.replied) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                </div>

                {/* Sentiment bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width: `${
                          (analytics.positive_replies / analytics.replied) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-gray-400 h-full"
                      style={{
                        width: `${
                          (analytics.neutral_replies / analytics.replied) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-red-500 h-full"
                      style={{
                        width: `${
                          (analytics.negative_replies / analytics.replied) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-2xl mb-2 block">💬</span>
                <p className="text-sm">No replies yet</p>
              </div>
            )}

            {analytics.average_time_to_reply && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Average time to reply:{" "}
                  <span className="font-medium text-gray-700">
                    {analytics.average_time_to_reply}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
