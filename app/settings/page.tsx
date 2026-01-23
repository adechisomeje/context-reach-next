"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailSignature, CreateSignatureRequest, ClosingStyle } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const OAUTH_API_URL = process.env.NEXT_PUBLIC_OAUTH_API_URL || "http://localhost:8004";

interface GmailStatus {
  connected: boolean;
  email?: string;
  dailySendCount?: number;
  dailyLimit?: number;
}

const CLOSING_OPTIONS: { value: ClosingStyle; label: string }[] = [
  { value: "best_regards", label: "Best regards" },
  { value: "thanks", label: "Thanks" },
  { value: "cheers", label: "Cheers" },
  { value: "sincerely", label: "Sincerely" },
  { value: "warm_regards", label: "Warm regards" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Gmail connection state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [gmailLoading, setGmailLoading] = useState(true);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailDisconnecting, setGmailDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSignatureRequest>({
    name: "",
    first_name: "",
    last_name: "",
    title: "",
    company: "",
    closing: "best_regards",
    is_default: false,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSignature, setDeletingSignature] = useState<EmailSignature | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSignatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/settings/signatures`);
      if (!response.ok) {
        throw new Error("Failed to fetch signatures");
      }
      const data = await response.json();
      setSignatures(data);
    } catch (err) {
      console.error("Failed to fetch signatures:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch signatures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  // Fetch Gmail connection status
  const fetchGmailStatus = async () => {
    if (!user?.id) return;
    
    setGmailLoading(true);
    try {
      const response = await authFetch(`${OAUTH_API_URL}/api/oauth/google/status?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setGmailStatus(data);
      } else {
        setGmailStatus({ connected: false });
      }
    } catch (err) {
      console.error("Failed to fetch Gmail status:", err);
      setGmailStatus({ connected: false });
    } finally {
      setGmailLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchGmailStatus();
    }
    
    // Check for callback params from Gmail OAuth
    const params = new URLSearchParams(window.location.search);
    const gmailConnected = params.get("gmail_connected");
    const gmailError = params.get("gmail_error");
    
    if (gmailConnected === "true") {
      setSuccessMessage("Gmail connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", "/settings");
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Refresh Gmail status
      if (user?.id) {
        fetchGmailStatus();
      }
    }
    
    if (gmailError) {
      setError(decodeURIComponent(gmailError));
      // Clean up URL
      window.history.replaceState({}, "", "/settings");
    }
  }, [user?.id]);

  // Connect Gmail
  const connectGmail = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }
    
    setGmailConnecting(true);
    try {
      const response = await authFetch(`${OAUTH_API_URL}/api/oauth/google/auth-url?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.auth_url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to get Gmail authorization URL");
      }
    } catch (err) {
      console.error("Failed to connect Gmail:", err);
      setError("Failed to connect Gmail");
    } finally {
      setGmailConnecting(false);
    }
  };

  // Disconnect Gmail
  const disconnectGmail = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }
    
    setGmailDisconnecting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${OAUTH_API_URL}/api/oauth/google/disconnect?user_id=${user.id}`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        setGmailStatus({ connected: false });
        setShowDisconnectModal(false);
        setSuccessMessage("Gmail disconnected successfully");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to disconnect Gmail");
      }
    } catch (err) {
      console.error("Failed to disconnect Gmail:", err);
      setError("Failed to disconnect Gmail");
    } finally {
      setGmailDisconnecting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      first_name: "",
      last_name: "",
      title: "",
      company: "",
      closing: "best_regards",
      is_default: false,
    });
    setEditingSignature(null);
    setShowForm(false);
  };

  const handleEdit = (signature: EmailSignature) => {
    setEditingSignature(signature);
    setFormData({
      name: signature.name,
      first_name: signature.first_name,
      last_name: signature.last_name || "",
      title: signature.title || "",
      company: signature.company || "",
      closing: signature.closing,
      is_default: signature.is_default,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.first_name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingSignature
        ? `${API_URL}/api/settings/signatures/${editingSignature.id}`
        : `${API_URL}/api/settings/signatures`;
      
      const response = await authFetch(url, {
        method: editingSignature ? "PUT" : "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingSignature ? "update" : "create"} signature`);
      }

      await fetchSignatures();
      resetForm();
    } catch (err) {
      console.error("Failed to save signature:", err);
      setError(err instanceof Error ? err.message : "Failed to save signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (signature: EmailSignature) => {
    try {
      const response = await authFetch(
        `${API_URL}/api/settings/signatures/${signature.id}/default`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to set default signature");
      }

      await fetchSignatures();
    } catch (err) {
      console.error("Failed to set default:", err);
      setError(err instanceof Error ? err.message : "Failed to set default signature");
    }
  };

  const handleDelete = async () => {
    if (!deletingSignature) return;

    setIsDeleting(true);
    try {
      const response = await authFetch(
        `${API_URL}/api/settings/signatures/${deletingSignature.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete signature");
      }

      await fetchSignatures();
      setShowDeleteModal(false);
      setDeletingSignature(null);
    } catch (err) {
      console.error("Failed to delete signature:", err);
      setError(err instanceof Error ? err.message : "Failed to delete signature");
    } finally {
      setIsDeleting(false);
    }
  };

  const getClosingLabel = (closing: ClosingStyle) => {
    return CLOSING_OPTIONS.find((opt) => opt.value === closing)?.label || closing;
  };

  const formatSignaturePreview = (sig: EmailSignature) => {
    const lines = [getClosingLabel(sig.closing) + ",", sig.first_name + (sig.last_name ? ` ${sig.last_name}` : "")];
    if (sig.title) lines.push(sig.title);
    if (sig.company) lines.push(sig.company);
    return lines;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your email signatures and preferences
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Gmail Connection Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              </div>
              <div>
                <CardTitle>Gmail Connection</CardTitle>
                <CardDescription>
                  Connect your Gmail account to send personalized outreach emails
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {gmailLoading ? (
              <div className="flex items-center gap-3 py-4">
                <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-500">Checking connection status...</span>
              </div>
            ) : gmailStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Connected</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">{gmailStatus.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDisconnectModal(true)}
                    className="text-slate-600 hover:text-red-600 hover:border-red-300"
                  >
                    Disconnect
                  </Button>
                </div>
                
                {/* Daily Sending Stats */}
                {gmailStatus.dailyLimit !== undefined && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Daily sending limit</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {gmailStatus.dailySendCount || 0} / {gmailStatus.dailyLimit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-white rounded-full transition-all"
                        style={{ width: `${Math.min(((gmailStatus.dailySendCount || 0) / gmailStatus.dailyLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Not connected</p>
                  <p className="text-sm text-slate-500">Connect your Gmail to start sending personalized emails</p>
                </div>
                <Button
                  onClick={connectGmail}
                  disabled={gmailConnecting}
                  className="gap-2"
                >
                  {gmailConnecting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                      Connect Gmail
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Signatures Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email Signatures</CardTitle>
                <CardDescription>
                  Create and manage signatures for your outreach emails
                </CardDescription>
              </div>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Signature
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Signature Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <h3 className="font-medium text-slate-900 dark:text-white mb-4">
                  {editingSignature ? "Edit Signature" : "New Signature"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Signature Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Work Signature"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closing">Closing Style</Label>
                    <select
                      id="closing"
                      value={formData.closing}
                      onChange={(e) => setFormData({ ...formData, closing: e.target.value as ClosingStyle })}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-sm"
                    >
                      {CLOSING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="Sales Manager"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Set as default signature
                    </span>
                  </label>
                </div>

                {/* Preview */}
                {formData.first_name && (
                  <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Preview</span>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                      <p>{getClosingLabel(formData.closing || "best_regards")},</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formData.first_name} {formData.last_name}
                      </p>
                      {formData.title && <p>{formData.title}</p>}
                      {formData.company && <p>{formData.company}</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.name.trim() || !formData.first_name.trim()}>
                    {isSubmitting ? "Saving..." : editingSignature ? "Update Signature" : "Create Signature"}
                  </Button>
                </div>
              </form>
            )}

            {/* Signatures List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-slate-500">Loading signatures...</span>
              </div>
            ) : signatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-slate-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400">No signatures yet</p>
                <p className="text-sm text-slate-500">Create your first signature to use in outreach emails</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-start justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {signature.name}
                        </span>
                        {signature.is_default && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                        {formatSignaturePreview(signature).map((line, i) => (
                          <p key={i} className={i === 1 ? "font-medium text-slate-800 dark:text-slate-200" : ""}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!signature.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(signature)}
                          className="text-slate-600"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(signature)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingSignature(signature);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSignature && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Delete Signature
                </h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-medium">"{deletingSignature.name}"</span>?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingSignature(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Disconnect Gmail
                </h3>
                <p className="text-sm text-slate-500">
                  {gmailStatus?.email}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to disconnect your Gmail account? You will no longer be able to send emails until you reconnect.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDisconnectModal(false)}
                disabled={gmailDisconnecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={disconnectGmail}
                disabled={gmailDisconnecting}
              >
                {gmailDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
