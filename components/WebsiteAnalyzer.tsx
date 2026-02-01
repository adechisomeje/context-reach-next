"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WebsiteAnalysisResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface WebsiteAnalyzerProps {
  onAnalysisComplete: (description: string, metadata: WebsiteAnalysisResponse) => void;
  onCancel: () => void;
}

interface AnalysisState {
  isLoading: boolean;
  result: WebsiteAnalysisResponse | null;
  error: string | null;
  progress: number;
}

export function WebsiteAnalyzer({ onAnalysisComplete, onCancel }: WebsiteAnalyzerProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    progress: 0,
  });

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!websiteUrl.trim() || !isValidUrl(websiteUrl)) {
      setState(prev => ({ ...prev, error: "Please enter a valid URL (starting with http:// or https://)" }));
      return;
    }

    setState({ isLoading: true, result: null, error: null, progress: 10 });

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 15, 90),
      }));
    }, 2000);

    try {
      const response = await authFetch(`${API_URL}/api/orchestration/analyze-website`, {
        method: "POST",
        body: JSON.stringify({
          website_url: websiteUrl,
          additional_context: additionalContext || undefined,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result: WebsiteAnalysisResponse = await response.json();

      if (result.success) {
        setEditedDescription(result.solution_description || "");
        setState({ isLoading: false, result, error: null, progress: 100 });
      } else {
        setState({
          isLoading: false,
          result: null,
          error: result.error || "Analysis failed. Please try again.",
          progress: 0,
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      setState({
        isLoading: false,
        result: null,
        error: err instanceof Error ? err.message : "Failed to connect to server. Please try again.",
        progress: 0,
      });
    }
  };

  const handleUseDescription = () => {
    if (state.result) {
      onAnalysisComplete(editedDescription, {
        ...state.result,
        solution_description: editedDescription,
      });
    }
  };

  const handleReanalyze = () => {
    setState({ isLoading: false, result: null, error: null, progress: 0 });
    setEditedDescription("");
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ High Confidence: {score}%</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">🟡 Medium Confidence: {score}%</Badge>;
    } else {
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">🟠 Low Confidence: {score}%</Badge>;
    }
  };

  // Loading State
  if (state.isLoading) {
    return (
      <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              🔍 Analyzing Your Website...
            </h3>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {Math.round(state.progress)}% complete
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-xs mx-auto space-y-2 text-left">
            <div className={`flex items-center gap-2 text-sm ${state.progress > 20 ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
              {state.progress > 20 ? "✅" : "🔄"} Scraping website content
            </div>
            <div className={`flex items-center gap-2 text-sm ${state.progress > 50 ? "text-green-600 dark:text-green-400" : state.progress > 20 ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
              {state.progress > 50 ? "✅" : state.progress > 20 ? "🔄" : "⏳"} Analyzing with AI
            </div>
            <div className={`flex items-center gap-2 text-sm ${state.progress > 80 ? "text-green-600 dark:text-green-400" : state.progress > 50 ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
              {state.progress > 80 ? "✅" : state.progress > 50 ? "🔄" : "⏳"} Generating solution description
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            This usually takes 15-45 seconds
          </p>
        </div>
      </Card>
    );
  }

  // Results State
  if (state.result) {
    return (
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h3 className="font-semibold text-slate-900 dark:text-white">Website Analysis Complete</h3>
            </div>
            {state.result.confidence_score !== undefined && getConfidenceBadge(state.result.confidence_score)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Info */}
          {(state.result.company_name || state.result.product_category) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {state.result.company_name && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Company: </span>
                  <span className="font-medium text-slate-900 dark:text-white">{state.result.company_name}</span>
                </div>
              )}
              {state.result.product_category && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Category: </span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">{state.result.product_category}</span>
                </div>
              )}
            </div>
          )}

          {/* Low confidence warning */}
          {state.result.confidence_score !== undefined && state.result.confidence_score < 60 && (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                ⚠️ Low confidence analysis. Please review and edit the description carefully before proceeding.
              </p>
            </div>
          )}

          {/* Generated Description - Editable */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Generated Solution Description
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">📝 Click to edit</span>
            </label>
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Solution description..."
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Features */}
            {state.result.key_features && state.result.key_features.length > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Key Features</h4>
                <ul className="space-y-1">
                  {state.result.key_features.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {state.result.target_audience && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Target Audience</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{state.result.target_audience}</p>
              </div>
            )}

            {/* Value Propositions */}
            {state.result.value_propositions && state.result.value_propositions.length > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Value Propositions</h4>
                <ul className="space-y-1">
                  {state.result.value_propositions.map((value, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pain Points Addressed */}
            {state.result.pain_points_addressed && state.result.pain_points_addressed.length > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Pain Points Addressed</h4>
                <ul className="space-y-1">
                  {state.result.pain_points_addressed.map((pain, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">→</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleReanalyze}
              className="text-slate-600 dark:text-slate-400"
            >
              🔄 Re-analyze
            </Button>
            <Button
              onClick={handleUseDescription}
              disabled={!editedDescription.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              ✅ Use This & Continue →
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Input Form State (default)
  return (
    <Card className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🌐</span>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analyze Your Website</h3>
        </div>

        {/* Website URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Website URL <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              if (state.error) setState(prev => ({ ...prev, error: null }));
            }}
            placeholder="https://yourcompany.com"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Additional Context <span className="text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="E.g., We primarily sell to enterprise fintech companies in Africa and Middle East..."
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            ℹ️ Add any context to help improve the analysis (target market, unique selling points, etc.)
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">⚠️ {state.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-slate-600 dark:text-slate-400"
          >
            ← Back to Manual Entry
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!websiteUrl.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            🔍 Analyze Website
          </Button>
        </div>
      </div>
    </Card>
  );
}
