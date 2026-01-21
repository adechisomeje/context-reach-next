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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const CLOSING_OPTIONS: { value: ClosingStyle; label: string }[] = [
  { value: "best_regards", label: "Best regards" },
  { value: "thanks", label: "Thanks" },
  { value: "cheers", label: "Cheers" },
  { value: "sincerely", label: "Sincerely" },
  { value: "warm_regards", label: "Warm regards" },
];

export default function SettingsPage() {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

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
    </div>
  );
}
