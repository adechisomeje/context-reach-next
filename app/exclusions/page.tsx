"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Types
interface ExclusionEntry {
  id: string;
  entry_type: "domain" | "email" | "company_name";
  value: string;
  normalized_value: string;
  notes: string | null;
  created_at: string;
}

interface ExclusionList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  entry_count: number;
  entries?: ExclusionEntry[];
}

interface ExclusionTypeInfo {
  count: number;
  credit_impact: string;
  description: string;
}

interface ExclusionSummary {
  total_lists: number;
  active_lists: number;
  total_entries: number;
  by_type?: {
    domain?: ExclusionTypeInfo;
    email?: ExclusionTypeInfo;
    company_name?: ExclusionTypeInfo;
  };
  lists: {
    id: string;
    name: string;
    is_active: boolean;
    entry_count: number;
  }[];
}

interface EntriesResponse {
  entries: ExclusionEntry[];
  total: number;
  limit: number;
  offset: number;
}

type EntryType = "domain" | "email" | "company_name";

const entryTypeLabels: Record<EntryType, string> = {
  domain: "Domain",
  email: "Email",
  company_name: "Company Name",
};

const entryTypeIcons: Record<EntryType, string> = {
  domain: "🌐",
  email: "📧",
  company_name: "🏢",
};

const entryTypeDescriptions: Record<EntryType, { when: string; impact: string }> = {
  domain: { when: "Before Apollo reveal", impact: "FREE - Saves credits" },
  email: { when: "After Apollo reveal", impact: "Credits still charged" },
  company_name: { when: "Before Apollo reveal", impact: "FREE - Saves credits" },
};

export default function ExclusionsPage() {
  const [lists, setLists] = useState<ExclusionList[]>([]);
  const [summary, setSummary] = useState<ExclusionSummary | null>(null);
  const [selectedList, setSelectedList] = useState<ExclusionList | null>(null);
  const [entries, setEntries] = useState<ExclusionEntry[]>([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  
  // Create list modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Add entry modal
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [newEntryType, setNewEntryType] = useState<EntryType>("domain");
  const [newEntryValue, setNewEntryValue] = useState("");
  const [newEntryNotes, setNewEntryNotes] = useState("");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  // Bulk add modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkEntryType, setBulkEntryType] = useState<EntryType>("domain");
  const [bulkValues, setBulkValues] = useState("");
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ added: number; skipped: number } | null>(null);
  
  // Import CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  
  // Filter entries
  const [entryTypeFilter, setEntryTypeFilter] = useState<EntryType | "">("");
  const [entriesOffset, setEntriesOffset] = useState(0);
  const entriesLimit = 50;

  // Check value
  const [checkValue, setCheckValue] = useState("");
  const [checkType, setCheckType] = useState<EntryType>("domain");
  const [checkResult, setCheckResult] = useState<{
    is_excluded: boolean;
    matched_in_list?: string;
    normalized_value: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch exclusion summary:", err);
    }
  };

  // Fetch all lists
  const fetchLists = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/lists?active_only=false`);
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      }
    } catch (err) {
      console.error("Failed to fetch exclusion lists:", err);
    }
  };

  // Fetch entries for selected list
  const fetchEntries = async (listId: string, offset: number = 0, type?: EntryType) => {
    setIsLoadingEntries(true);
    try {
      let url = `${API_URL}/api/exclusions/lists/${listId}/entries?limit=${entriesLimit}&offset=${offset}`;
      if (type) {
        url += `&entry_type=${type}`;
      }
      const response = await authFetch(url);
      if (response.ok) {
        const data: EntriesResponse = await response.json();
        setEntries(data.entries);
        setEntriesTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSummary(), fetchLists()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Load entries when list is selected
  useEffect(() => {
    if (selectedList) {
      setEntriesOffset(0);
      fetchEntries(selectedList.id, 0, entryTypeFilter || undefined);
    }
  }, [selectedList, entryTypeFilter]);

  // Create new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/lists`, {
        method: "POST",
        body: JSON.stringify({
          name: newListName.trim(),
          description: newListDescription.trim() || null,
        }),
      });
      if (response.ok) {
        const newList = await response.json();
        setLists([...lists, newList]);
        setShowCreateModal(false);
        setNewListName("");
        setNewListDescription("");
        setSelectedList(newList);
        await fetchSummary();
      }
    } catch (err) {
      console.error("Failed to create list:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete list
  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list and all its entries?")) return;
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/lists/${listId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLists(lists.filter(l => l.id !== listId));
        if (selectedList?.id === listId) {
          setSelectedList(null);
          setEntries([]);
        }
        await fetchSummary();
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  };

  // Toggle list active status
  const handleToggleActive = async (list: ExclusionList) => {
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/lists/${list.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !list.is_active }),
      });
      if (response.ok) {
        const updated = await response.json();
        setLists(lists.map(l => l.id === list.id ? { ...l, is_active: updated.is_active } : l));
        if (selectedList?.id === list.id) {
          setSelectedList({ ...selectedList, is_active: updated.is_active });
        }
        await fetchSummary();
      }
    } catch (err) {
      console.error("Failed to toggle list status:", err);
    }
  };

  // Add single entry
  const handleAddEntry = async () => {
    if (!selectedList || !newEntryValue.trim()) return;
    setIsAddingEntry(true);
    try {
      const response = await authFetch(`${API_URL}/api/exclusions/lists/${selectedList.id}/entries`, {
        method: "POST",
        body: JSON.stringify({
          entry_type: newEntryType,
          value: newEntryValue.trim(),
          notes: newEntryNotes.trim() || null,
        }),
      });
      if (response.ok) {
        setShowAddEntryModal(false);
        setNewEntryValue("");
        setNewEntryNotes("");
        await fetchEntries(selectedList.id, entriesOffset, entryTypeFilter || undefined);
        await fetchSummary();
        await fetchLists();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to add entry");
      }
    } catch (err) {
      console.error("Failed to add entry:", err);
    } finally {
      setIsAddingEntry(false);
    }
  };

  // Bulk add entries
  const handleBulkAdd = async () => {
    if (!selectedList || !bulkValues.trim()) return;
    setIsAddingBulk(true);
    setBulkResult(null);
    try {
      const values = bulkValues.split("\n").map(v => v.trim()).filter(v => v);
      const entries = values.map(value => ({
        entry_type: bulkEntryType,
        value,
      }));
      
      const response = await authFetch(`${API_URL}/api/exclusions/lists/${selectedList.id}/entries/bulk`, {
        method: "POST",
        body: JSON.stringify({ entries }),
      });
      if (response.ok) {
        const result = await response.json();
        setBulkResult({ added: result.added, skipped: result.skipped });
        await fetchEntries(selectedList.id, entriesOffset, entryTypeFilter || undefined);
        await fetchSummary();
        await fetchLists();
        if (result.added > 0) {
          setBulkValues("");
        }
      }
    } catch (err) {
      console.error("Failed to bulk add:", err);
    } finally {
      setIsAddingBulk(false);
    }
  };

  // Import CSV
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedList) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(
        `${API_URL}/api/exclusions/lists/${selectedList.id}/import?entry_type=${bulkEntryType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setImportResult(result);
        await fetchEntries(selectedList.id, entriesOffset, entryTypeFilter || undefined);
        await fetchSummary();
        await fetchLists();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to import CSV");
      }
    } catch (err) {
      console.error("Failed to import CSV:", err);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedList) return;
    try {
      const response = await authFetch(
        `${API_URL}/api/exclusions/lists/${selectedList.id}/entries/${entryId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setEntries(entries.filter(e => e.id !== entryId));
        setEntriesTotal(prev => prev - 1);
        await fetchSummary();
        await fetchLists();
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Clear all entries
  const handleClearEntries = async (type?: EntryType) => {
    if (!selectedList) return;
    const typeLabel = type ? entryTypeLabels[type].toLowerCase() + " entries" : "all entries";
    if (!confirm(`Are you sure you want to clear ${typeLabel} from this list?`)) return;
    
    try {
      let url = `${API_URL}/api/exclusions/lists/${selectedList.id}/clear`;
      if (type) {
        url += `?entry_type=${type}`;
      }
      const response = await authFetch(url, { method: "DELETE" });
      if (response.ok) {
        await fetchEntries(selectedList.id, 0, entryTypeFilter || undefined);
        await fetchSummary();
        await fetchLists();
      }
    } catch (err) {
      console.error("Failed to clear entries:", err);
    }
  };

  // Check if value is excluded
  const handleCheckValue = async () => {
    if (!checkValue.trim()) return;
    setIsChecking(true);
    setCheckResult(null);
    try {
      const response = await authFetch(
        `${API_URL}/api/exclusions/check?value=${encodeURIComponent(checkValue.trim())}&entry_type=${checkType}`
      );
      if (response.ok) {
        const result = await response.json();
        setCheckResult(result);
      }
    } catch (err) {
      console.error("Failed to check value:", err);
    } finally {
      setIsChecking(false);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    window.open(`${API_URL}/api/exclusions/template/csv?entry_type=${bulkEntryType}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
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
              Exclusion Lists
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage domains, emails, and companies to skip during discovery
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            + Create List
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Lists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.total_lists}
                </div>
                <p className="text-sm text-slate-500">{summary.active_lists} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.total_entries}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>🌐 Domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{summary.by_type?.domain?.count ?? 0}</div>
                <p className="text-xs text-emerald-600">{summary.by_type?.domain?.credit_impact || "Saves credits"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>🏢 Companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{summary.by_type?.company_name?.count ?? 0}</div>
                <p className="text-xs text-emerald-600">{summary.by_type?.company_name?.credit_impact || "Saves credits"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>📧 Emails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{summary.by_type?.email?.count ?? 0}</div>
                <p className="text-xs text-slate-500">{summary.by_type?.email?.credit_impact || "Post-reveal filter"}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Check Value Tool */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Check if Value is Excluded</CardTitle>
            <CardDescription>Test if a domain, email, or company would be excluded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label className="text-sm mb-1 block">Value</Label>
                <Input
                  value={checkValue}
                  onChange={(e) => setCheckValue(e.target.value)}
                  placeholder="e.g., competitor.com"
                />
              </div>
              <div className="w-40">
                <Label className="text-sm mb-1 block">Type</Label>
                <select
                  value={checkType}
                  onChange={(e) => setCheckType(e.target.value as EntryType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                >
                  <option value="domain">Domain</option>
                  <option value="email">Email</option>
                  <option value="company_name">Company</option>
                </select>
              </div>
              <Button onClick={handleCheckValue} disabled={isChecking || !checkValue.trim()}>
                {isChecking ? "Checking..." : "Check"}
              </Button>
            </div>
            {checkResult && (
              <div className={`mt-4 p-4 rounded-lg ${checkResult.is_excluded ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{checkResult.is_excluded ? "🚫" : "✅"}</span>
                  <div>
                    <p className={`font-medium ${checkResult.is_excluded ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                      {checkResult.is_excluded ? "This value IS excluded" : "This value is NOT excluded"}
                    </p>
                    {checkResult.is_excluded && checkResult.matched_in_list && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Matched in list: {checkResult.matched_in_list}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      Normalized: {checkResult.normalized_value}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lists Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Lists</CardTitle>
              <CardDescription>Select a list to manage entries</CardDescription>
            </CardHeader>
            <CardContent>
              {lists.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No exclusion lists yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-blue-600 hover:underline mt-2"
                  >
                    Create your first list
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      onClick={() => setSelectedList(list)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedList?.id === list.id
                          ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {list.name}
                          </span>
                          {!list.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">{list.entry_count}</span>
                      </div>
                      {list.description && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{list.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entries Panel */}
          <Card className="lg:col-span-2">
            {selectedList ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedList.name}
                        {!selectedList.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {selectedList.description || `${selectedList.entry_count} entries`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(selectedList)}
                      >
                        {selectedList.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteList(selectedList.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button size="sm" onClick={() => setShowAddEntryModal(true)}>
                      + Add Entry
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowBulkModal(true)}>
                      Bulk Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearEntries()}
                      className="text-red-600"
                    >
                      Clear All
                    </Button>
                    <div className="flex-1" />
                    <select
                      value={entryTypeFilter}
                      onChange={(e) => setEntryTypeFilter(e.target.value as EntryType | "")}
                      className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                    >
                      <option value="">All Types</option>
                      <option value="domain">Domains</option>
                      <option value="email">Emails</option>
                      <option value="company_name">Companies</option>
                    </select>
                  </div>

                  {/* Entries List */}
                  {isLoadingEntries ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 dark:border-white"></div>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p>No entries in this list</p>
                      <button
                        onClick={() => setShowAddEntryModal(true)}
                        className="text-blue-600 hover:underline mt-2"
                      >
                        Add your first entry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{entryTypeIcons[entry.entry_type]}</span>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {entry.value}
                                </p>
                                {entry.normalized_value !== entry.value && (
                                  <p className="text-xs text-slate-500">
                                    Normalized: {entry.normalized_value}
                                  </p>
                                )}
                                {entry.notes && (
                                  <p className="text-sm text-slate-500">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {entriesTotal > entriesLimit && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-sm text-slate-500">
                            Showing {entriesOffset + 1}-{Math.min(entriesOffset + entriesLimit, entriesTotal)} of {entriesTotal}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={entriesOffset === 0}
                              onClick={() => {
                                const newOffset = Math.max(0, entriesOffset - entriesLimit);
                                setEntriesOffset(newOffset);
                                fetchEntries(selectedList.id, newOffset, entryTypeFilter || undefined);
                              }}
                            >
                              Previous
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={entriesOffset + entriesLimit >= entriesTotal}
                              onClick={() => {
                                const newOffset = entriesOffset + entriesLimit;
                                setEntriesOffset(newOffset);
                                fetchEntries(selectedList.id, newOffset, entryTypeFilter || undefined);
                              }}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-slate-500">Select a list to view entries</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Create List Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create Exclusion List</h2>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Competitors"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateList} disabled={isCreating || !newListName.trim()}>
                  {isCreating ? "Creating..." : "Create List"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add Entry</h2>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <select
                    value={newEntryType}
                    onChange={(e) => setNewEntryType(e.target.value as EntryType)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                  >
                    {(Object.keys(entryTypeLabels) as EntryType[]).map((type) => (
                      <option key={type} value={type}>{entryTypeLabels[type]}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {entryTypeDescriptions[newEntryType].when} • {entryTypeDescriptions[newEntryType].impact}
                  </p>
                </div>
                <div>
                  <Label>Value *</Label>
                  <Input
                    value={newEntryValue}
                    onChange={(e) => setNewEntryValue(e.target.value)}
                    placeholder={newEntryType === "domain" ? "competitor.com" : newEntryType === "email" ? "skip@example.com" : "Acme Corp"}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={newEntryNotes}
                    onChange={(e) => setNewEntryNotes(e.target.value)}
                    placeholder="Optional note"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddEntryModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry} disabled={isAddingEntry || !newEntryValue.trim()}>
                  {isAddingEntry ? "Adding..." : "Add Entry"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Bulk Add Entries</h2>
              <div className="space-y-4">
                <div>
                  <Label>Entry Type</Label>
                  <select
                    value={bulkEntryType}
                    onChange={(e) => setBulkEntryType(e.target.value as EntryType)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                  >
                    {(Object.keys(entryTypeLabels) as EntryType[]).map((type) => (
                      <option key={type} value={type}>{entryTypeLabels[type]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Values (one per line)</Label>
                  <Textarea
                    value={bulkValues}
                    onChange={(e) => setBulkValues(e.target.value)}
                    placeholder={`Enter one ${bulkEntryType.replace("_", " ")} per line...`}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? "Importing..." : "Import CSV"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    Download Template
                  </Button>
                </div>
                {(bulkResult || importResult) && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                    {bulkResult && (
                      <p>Added {bulkResult.added} entries, skipped {bulkResult.skipped} duplicates</p>
                    )}
                    {importResult && (
                      <p>Imported {importResult.added} entries, skipped {importResult.skipped} duplicates</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setShowBulkModal(false);
                  setBulkResult(null);
                  setImportResult(null);
                }}>
                  Close
                </Button>
                <Button onClick={handleBulkAdd} disabled={isAddingBulk || !bulkValues.trim()}>
                  {isAddingBulk ? "Adding..." : "Add Entries"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
