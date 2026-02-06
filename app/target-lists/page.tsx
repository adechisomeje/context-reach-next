"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { TargetList, TargetListContact } from "@/lib/types";
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

// Types based on API documentation

interface ValidationResult {
  is_valid: boolean;
  total_rows: number;
  valid_rows: number;
  errors: Array<{ row: number; email: string; error: string }>;
  preview: Array<{
    first_name: string;
    last_name: string;
    email: string;
    website: string;
    company_name?: string;
    title?: string;
  }>;
  max_allowed: number;
}

interface ImportResult {
  added: number;
  updated: number;
  errors: Array<{ row: number; email: string; error: string }>;
  total_processed: number;
  validation_results?: {
    valid_emails: number;
    invalid_emails: number;
  };
}

// Icons
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Loader: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

export default function TargetListsPage() {
  // State
  const [lists, setLists] = useState<TargetList[]>([]);
  const [selectedList, setSelectedList] = useState<TargetList | null>(null);
  const [contacts, setContacts] = useState<TargetListContact[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create list modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit list modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editListName, setEditListName] = useState("");
  const [editListDescription, setEditListDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Add contact modal state
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    website: "",
    company_name: "",
    title: "",
  });
  const [isAddingContact, setIsAddingContact] = useState(false);

  // CSV Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validateMx, setValidateMx] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "list" | "contact" | "all-contacts"; id?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch lists on mount
  useEffect(() => {
    fetchLists();
  }, []);

  // Fetch contacts when list is selected
  useEffect(() => {
    if (selectedList) {
      fetchContacts(selectedList.id);
    } else {
      setContacts([]);
      setContactsTotal(0);
    }
  }, [selectedList?.id]);

  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists`);
      if (!response.ok) {
        throw new Error("Failed to fetch target lists");
      }
      const data = await response.json();
      // Handle both array and object with lists property
      const listsArray = Array.isArray(data) ? data : (data.lists || []);
      setLists(listsArray);
    } catch (err) {
      console.error("Error fetching target lists:", err);
      setError(err instanceof Error ? err.message : "Failed to load target lists");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (listId: string) => {
    setIsLoadingContacts(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${listId}/contacts`);
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const data = await response.json();
      // Handle both array and object with contacts property
      const contactsArray = Array.isArray(data) ? data : (data.contacts || []);
      setContacts(contactsArray);
      setContactsTotal(Array.isArray(data) ? contactsArray.length : (data.total || contactsArray.length));
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setContacts([]);
      setContactsTotal(0);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName.trim(),
          description: newListDescription.trim() || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create list");
      }
      const newList = await response.json();
      setLists((prev) => [newList, ...prev]);
      setShowCreateModal(false);
      setNewListName("");
      setNewListDescription("");
      setSelectedList(newList);
    } catch (err) {
      console.error("Error creating list:", err);
      setError(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateList = async () => {
    if (!selectedList || !editListName.trim()) return;
    setIsEditing(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editListName.trim(),
          description: editListDescription.trim() || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update list");
      }
      const updatedList = await response.json();
      setLists((prev) => prev.map((l) => (l.id === updatedList.id ? updatedList : l)));
      setSelectedList(updatedList);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating list:", err);
      setError(err instanceof Error ? err.message : "Failed to update list");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete list");
      }
      setLists((prev) => prev.filter((l) => l.id !== selectedList.id));
      setSelectedList(null);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting list:", err);
      setError(err instanceof Error ? err.message : "Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (list: TargetList) => {
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !list.is_active }),
      });
      if (!response.ok) {
        throw new Error("Failed to update list");
      }
      const updatedList = await response.json();
      setLists((prev) => prev.map((l) => (l.id === updatedList.id ? updatedList : l)));
      if (selectedList?.id === updatedList.id) {
        setSelectedList(updatedList);
      }
    } catch (err) {
      console.error("Error toggling list active state:", err);
      setError(err instanceof Error ? err.message : "Failed to update list");
    }
  };

  const handleAddContact = async () => {
    if (!selectedList || !newContact.first_name || !newContact.last_name || !newContact.email || !newContact.website) return;
    setIsAddingContact(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to add contact");
      }
      await fetchContacts(selectedList.id);
      await fetchLists(); // Refresh list counts
      setShowAddContactModal(false);
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        website: "",
        company_name: "",
        title: "",
      });
    } catch (err) {
      console.error("Error adding contact:", err);
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedList) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setContactsTotal((prev) => prev - 1);
      await fetchLists(); // Refresh list counts
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting contact:", err);
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllContacts = async () => {
    if (!selectedList) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}/contacts`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear contacts");
      }
      setContacts([]);
      setContactsTotal(0);
      await fetchLists(); // Refresh list counts
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error clearing contacts:", err);
      setError(err instanceof Error ? err.message : "Failed to clear contacts");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/target-lists/template`);
      if (!response.ok) {
        throw new Error("Failed to download template");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "target_list_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading template:", err);
      setError(err instanceof Error ? err.message : "Failed to download template");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setValidationResult(null);
      setImportResult(null);
    }
  };

  const handleValidateCSV = async () => {
    if (!selectedList || !importFile) return;
    setIsValidating(true);
    setValidationResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await authFetch(`${API_URL}/api/target-lists/${selectedList.id}/contacts/validate-csv`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to validate CSV");
      }
      const result = await response.json();
      setValidationResult(result);
    } catch (err) {
      console.error("Error validating CSV:", err);
      setError(err instanceof Error ? err.message : "Failed to validate CSV");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedList || !importFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const url = new URL(`${API_URL}/api/target-lists/${selectedList.id}/contacts/import`);
      url.searchParams.set("validate_mx", validateMx.toString());
      url.searchParams.set("skip_duplicates", skipDuplicates.toString());

      const response = await authFetch(url.toString(), {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to import CSV");
      }
      const result = await response.json();
      setImportResult(result);
      
      // Refresh data
      await fetchContacts(selectedList.id);
      await fetchLists();
    } catch (err) {
      console.error("Error importing CSV:", err);
      setError(err instanceof Error ? err.message : "Failed to import CSV");
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openEditModal = () => {
    if (selectedList) {
      setEditListName(selectedList.name);
      setEditListDescription(selectedList.description || "");
      setShowEditModal(true);
    }
  };

  const confirmDelete = (type: "list" | "contact" | "all-contacts", id?: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "list") {
      handleDeleteList();
    } else if (deleteTarget.type === "contact" && deleteTarget.id) {
      handleDeleteContact(deleteTarget.id);
    } else if (deleteTarget.type === "all-contacts") {
      handleClearAllContacts();
    }
  };

  // Calculate totals
  const totalLists = lists.length;
  const totalContacts = lists.reduce((sum, l) => sum + (l.contact_count || 0), 0);
  const totalValid = lists.reduce((sum, l) => sum + (l.valid_count || 0), 0);
  const activeLists = lists.filter((l) => l.is_active).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300">
            Dashboard
          </Link>
          <Icons.ChevronRight />
          <span className="text-slate-900 dark:text-white">Target Lists</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Target Lists</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Upload pre-defined contact lists for targeted outreach campaigns
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Icons.Plus />
            New List
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <Icons.AlertCircle />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <Icons.X />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icons.FileText />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLists}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icons.Check />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeLists}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icons.Users />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalContacts}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Icons.Mail />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalValid}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Valid Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Lists</CardTitle>
            <CardDescription>Click a list to view and manage contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icons.Loader />
                <span className="ml-2 text-slate-500">Loading lists...</span>
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icons.FileText />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">No target lists yet</p>
                <Button variant="outline" onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Icons.Plus />
                  Create Your First List
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedList?.id === list.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{list.name}</p>
                          <Badge variant={list.is_active ? "default" : "secondary"} className="text-xs">
                            {list.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {list.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                            {list.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Icons.Users />
                            {list.contact_count || 0} contacts
                          </span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Icons.Check />
                            {list.valid_count || 0} valid
                          </span>
                          {(list.invalid_count || 0) > 0 && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <Icons.X />
                              {list.invalid_count} invalid
                            </span>
                          )}
                        </div>
                      </div>
                      <Icons.ChevronRight />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card className="lg:col-span-2">
          {selectedList ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{selectedList.name}</CardTitle>
                      <Badge variant={selectedList.is_active ? "default" : "secondary"}>
                        {selectedList.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {selectedList.description && (
                      <CardDescription className="mt-1">{selectedList.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(selectedList)}>
                      {selectedList.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={openEditModal}>
                      <Icons.Edit />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => confirmDelete("list")}
                    >
                      <Icons.Trash />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddContactModal(true)} className="gap-1">
                      <Icons.Plus />
                      Add Contact
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)} className="gap-1">
                      <Icons.Upload />
                      Import CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1">
                      <Icons.Download />
                      Template
                    </Button>
                  </div>
                  {contacts.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 gap-1"
                      onClick={() => confirmDelete("all-contacts")}
                    >
                      <Icons.Trash />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Contacts List */}
                {isLoadingContacts ? (
                  <div className="flex items-center justify-center py-8">
                    <Icons.Loader />
                    <span className="ml-2 text-slate-500">Loading contacts...</span>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icons.Users />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No contacts in this list</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                      Add contacts manually or import from a CSV file
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" onClick={() => setShowAddContactModal(true)} className="gap-1">
                        <Icons.Plus />
                        Add Contact
                      </Button>
                      <Button variant="outline" onClick={() => setShowImportModal(true)} className="gap-1">
                        <Icons.Upload />
                        Import CSV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {contact.first_name} {contact.last_name}
                              </p>
                              {contact.is_valid ? (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                  Valid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                  Invalid
                                </Badge>
                              )}
                            </div>
                            {contact.title && (
                              <p className="text-sm text-slate-600 dark:text-slate-300">{contact.title}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Icons.Mail />
                                {contact.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icons.Globe />
                                {contact.website}
                              </span>
                              {contact.company_name && (
                                <span className="flex items-center gap-1">
                                  <Icons.Building />
                                  {contact.company_name}
                                </span>
                              )}
                            </div>
                            {contact.validation_error && (
                              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <Icons.AlertCircle />
                                {contact.validation_error}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => confirmDelete("contact", contact.id)}
                          >
                            <Icons.Trash />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination info */}
                {contactsTotal > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                    Showing {contacts.length} of {contactsTotal} contacts
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.FileText />
                </div>
                <p className="text-slate-500 dark:text-slate-400">Select a list to view its contacts</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Target List</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="listName">List Name *</Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Enterprise Leads Q1"
                  />
                </div>
                <div>
                  <Label htmlFor="listDescription">Description (optional)</Label>
                  <Textarea
                    id="listDescription"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Brief description of this list"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateList} disabled={!newListName.trim() || isCreating}>
                  {isCreating ? <Icons.Loader /> : "Create List"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {showEditModal && selectedList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Target List</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editListName">List Name *</Label>
                  <Input
                    id="editListName"
                    value={editListName}
                    onChange={(e) => setEditListName(e.target.value)}
                    placeholder="e.g., Enterprise Leads Q1"
                  />
                </div>
                <div>
                  <Label htmlFor="editListDescription">Description (optional)</Label>
                  <Textarea
                    id="editListDescription"
                    value={editListDescription}
                    onChange={(e) => setEditListDescription(e.target.value)}
                    placeholder="Brief description of this list"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateList} disabled={!editListName.trim() || isEditing}>
                  {isEditing ? <Icons.Loader /> : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && selectedList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Contact</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newContact.first_name}
                      onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newContact.last_name}
                      onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    value={newContact.website}
                    onChange={(e) => setNewContact({ ...newContact, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name (optional)</Label>
                  <Input
                    id="companyName"
                    value={newContact.company_name}
                    onChange={(e) => setNewContact({ ...newContact, company_name: e.target.value })}
                    placeholder="Example Inc"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                    placeholder="CEO"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddContactModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddContact}
                  disabled={
                    !newContact.first_name || !newContact.last_name || !newContact.email || !newContact.website || isAddingContact
                  }
                >
                  {isAddingContact ? <Icons.Loader /> : "Add Contact"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && selectedList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Import Contacts from CSV</h2>

              {/* File Upload */}
              <div className="mb-4">
                <Label>CSV File</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                </div>
                {importFile && (
                  <p className="mt-2 text-sm text-slate-500">
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="mb-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={validateMx}
                    onChange={(e) => setValidateMx(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Validate MX records (recommended)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Skip duplicate emails</span>
                </label>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Validation Results</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-500">Total Rows</p>
                      <p className="font-medium text-slate-900 dark:text-white">{validationResult.total_rows}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Valid</p>
                      <p className="font-medium text-green-600">{validationResult.valid_rows}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Errors</p>
                      <p className="font-medium text-red-600">{validationResult.errors.length}</p>
                    </div>
                  </div>
                  {validationResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                      <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                        {validationResult.errors.map((err, idx) => (
                          <p key={idx} className="text-red-500">
                            Row {err.row}: {err.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {validationResult.preview && validationResult.preview.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview (first 3):</p>
                      <div className="text-xs space-y-1">
                        {validationResult.preview.slice(0, 3).map((row, idx) => (
                          <p key={idx} className="text-slate-600 dark:text-slate-400">
                            {row.first_name} {row.last_name} - {row.email}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">Import Complete!</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Added</p>
                      <p className="font-medium text-green-800 dark:text-green-300">{importResult.added}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Updated</p>
                      <p className="font-medium text-blue-800 dark:text-blue-300">{importResult.updated}</p>
                    </div>
                    <div>
                      <p className="text-red-600">Errors</p>
                      <p className="font-medium text-red-800 dark:text-red-300">{importResult.errors.length}</p>
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-y-auto text-xs space-y-1">
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-red-500">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-2 mt-6">
                <Button variant="outline" onClick={handleDownloadTemplate} className="gap-1">
                  <Icons.Download />
                  Download Template
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetImportModal}>
                    {importResult ? "Done" : "Cancel"}
                  </Button>
                  {!importResult && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleValidateCSV}
                        disabled={!importFile || isValidating}
                      >
                        {isValidating ? <Icons.Loader /> : "Validate"}
                      </Button>
                      <Button
                        onClick={handleImportCSV}
                        disabled={!importFile || isImporting}
                      >
                        {isImporting ? <Icons.Loader /> : "Import"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Icons.AlertCircle />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {deleteTarget.type === "list"
                    ? "Delete Target List"
                    : deleteTarget.type === "all-contacts"
                    ? "Clear All Contacts"
                    : "Delete Contact"}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {deleteTarget.type === "list"
                  ? `Are you sure you want to delete "${selectedList?.name}"? This will also delete all contacts in this list. This action cannot be undone.`
                  : deleteTarget.type === "all-contacts"
                  ? `Are you sure you want to delete all ${contacts.length} contacts from this list? This action cannot be undone.`
                  : "Are you sure you want to delete this contact? This action cannot be undone."}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={executeDelete} disabled={isDeleting}>
                  {isDeleting ? <Icons.Loader /> : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
