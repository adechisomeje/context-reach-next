"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Types for credit endpoints
interface CreditBalance {
  current_balance: number;
  credits_per_action: number;
}

interface CreditSummary {
  current_balance: number;
  total_credits_used: number;
  total_credits_added: number;
  total_refunds: number;
  usage_by_type: Record<string, number>;
  transactions_last_30_days: number;
  credits_per_action: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

interface TransactionType {
  type: string;
  count: number;
  total_amount: number;
  label: string;
}

interface TransactionTypesResponse {
  transaction_types: TransactionType[];
}

export default function CreditsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [history, setHistory] = useState<CreditHistoryResponse | null>(null);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const pageSize = 10;

  // Fetch credit summary
  const fetchSummary = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/credits/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch credit summary:", err);
    }
  };

  // Fetch transaction types
  const fetchTransactionTypes = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/credits/transaction-types`);
      if (response.ok) {
        const data: TransactionTypesResponse = await response.json();
        setTransactionTypes(data.transaction_types);
      }
    } catch (err) {
      console.error("Failed to fetch transaction types:", err);
    }
  };

  // Fetch transaction history
  const fetchHistory = async (page: number, type?: string) => {
    setIsLoadingHistory(true);
    try {
      let url = `${API_URL}/api/credits/history?page=${page}&page_size=${pageSize}`;
      if (type) {
        url += `&transaction_type=${type}`;
      }
      const response = await authFetch(url);
      if (response.ok) {
        const data: CreditHistoryResponse = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch credit history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSummary(),
        fetchTransactionTypes(),
        fetchHistory(1),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Refetch history when page or filter changes
  useEffect(() => {
    if (!isLoading) {
      fetchHistory(currentPage, selectedType || undefined);
    }
  }, [currentPage, selectedType]);

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    if (amount > 0) return `+${amount}`;
    return amount.toString();
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-emerald-600 dark:text-emerald-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-slate-500";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "contact_discovery":
        return "🔍";
      case "context_research":
        return "🧠";
      case "campaign_reservation":
        return "📅";
      case "campaign_refund":
      case "refund_campaign_reserve":
      case "refund_contact_discovery":
        return "↩️";
      case "signup_bonus":
        return "🎁";
      case "purchase":
        return "💳";
      case "discovery_no_results":
        return "⚠️";
      default:
        return "📝";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Credits
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage your credits and view usage history
            </p>
          </div>
          <Button className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            Buy Credits
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">Current Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{summary?.current_balance?.toLocaleString() || 0}</div>
              <p className="text-sm text-slate-400 mt-1">
                {summary?.credits_per_action || 5} credits per action
              </p>
            </CardContent>
          </Card>

          {/* Total Used */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {summary?.total_credits_used?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>

          {/* Total Added */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                +{summary?.total_credits_added?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-slate-500 mt-1">Purchases & bonuses</p>
            </CardContent>
          </Card>

          {/* Refunds */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Refunded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                +{summary?.total_refunds?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-slate-500 mt-1">Credits returned</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Breakdown */}
        {summary?.usage_by_type && Object.keys(summary.usage_by_type).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Usage Breakdown</CardTitle>
              <CardDescription>Credits spent by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.usage_by_type).map(([type, amount]) => {
                  const typeInfo = transactionTypes.find(t => t.type === type);
                  return (
                    <div key={type} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{getTransactionIcon(type)}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {typeInfo?.label || type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {summary?.transactions_last_30_days || 0} transactions in last 30 days
                </CardDescription>
              </div>
              {/* Filter dropdown */}
              <select
                value={selectedType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">All Types</option>
                {transactionTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 dark:border-white"></div>
              </div>
            ) : history?.transactions && history.transactions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {history.transactions.map((transaction) => {
                    const typeInfo = transactionTypes.find(t => t.type === transaction.transaction_type);
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {typeInfo?.label || transaction.transaction_type.replace(/_/g, " ")}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getAmountColor(transaction.amount)}`}>
                            {formatAmount(transaction.amount)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Balance: {transaction.balance_after.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {history.total_count > pageSize && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-sm text-slate-500">
                      Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, history.total_count)} of {history.total_count}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-slate-500 px-2">
                        Page {currentPage} of {Math.ceil(history.total_count / pageSize)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!history.has_more}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No transactions found</p>
                {selectedType && (
                  <button
                    onClick={() => handleTypeFilter("")}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
