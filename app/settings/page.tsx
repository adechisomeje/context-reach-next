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
import { EmailSignature, CreateSignatureRequest, Organization, OrgMember, OrgInvite, OrgRole, OrgContactStats, PendingInvite } from "@/lib/types";
import { authFetch } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { API_URL } from "@/lib/config";

// Default HTML signature template
const DEFAULT_SIGNATURE_HTML = `<p>Best regards,</p>
<p><strong>Your Name</strong></p>
<p>Your Title</p>
<p>Your Company</p>`;

interface GmailStatus {
  connected: boolean;
  email?: string;
  dailySendCount?: number;
  dailyLimit?: number;
}

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
    html_content: DEFAULT_SIGNATURE_HTML,
    is_default: false,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSignature, setDeletingSignature] = useState<EmailSignature | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dev Mode state
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [devModeRecipients, setDevModeRecipients] = useState<string[]>([]);
  const [devModeLoading, setDevModeLoading] = useState(true);
  const [devModeSaving, setDevModeSaving] = useState(false);
  const [newDevEmail, setNewDevEmail] = useState("");

  // Calendar Link state
  const [calendarLink, setCalendarLink] = useState<string>("");
  const [calendarLinkLoading, setCalendarLinkLoading] = useState(true);
  const [calendarLinkSaving, setCalendarLinkSaving] = useState(false);
  const [calendarLinkInput, setCalendarLinkInput] = useState<string>("");

  // Organization state
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [orgInvites, setOrgInvites] = useState<OrgInvite[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [orgStats, setOrgStats] = useState<OrgContactStats | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaving, setOrgSaving] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveOrgModal, setShowLeaveOrgModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrgMember | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [userOrgRole, setUserOrgRole] = useState<OrgRole | null>(null);

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
      const response = await authFetch(`${API_URL}/api/oauth/google/status?user_id=${user.id}`);
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
      const response = await authFetch(`${API_URL}/api/oauth/google/auth-url?user_id=${user.id}`);
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
      const response = await fetch(`${API_URL}/api/oauth/google/disconnect?user_id=${user.id}`, {
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

  // Fetch Dev Mode settings
  const fetchDevModeSettings = async () => {
    setDevModeLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/settings/dev-mode`);
      if (response.ok) {
        const data = await response.json();
        setDevModeEnabled(data.dev_mode_enabled);
        setDevModeRecipients(data.dev_mode_recipients || []);
      }
    } catch (err) {
      console.error("Failed to fetch dev mode settings:", err);
    } finally {
      setDevModeLoading(false);
    }
  };

  // Update Dev Mode settings
  const updateDevModeSettings = async (updates: { dev_mode_enabled?: boolean; dev_mode_recipients?: string[] }) => {
    setDevModeSaving(true);
    try {
      const response = await authFetch(`${API_URL}/api/settings/dev-mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setDevModeEnabled(data.dev_mode_enabled);
        setDevModeRecipients(data.dev_mode_recipients || []);
        setSuccessMessage(data.dev_mode_enabled ? "Dev mode enabled" : "Dev mode disabled");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to update dev mode settings");
      }
    } catch (err) {
      console.error("Failed to update dev mode settings:", err);
      setError("Failed to update dev mode settings");
    } finally {
      setDevModeSaving(false);
    }
  };

  // Toggle Dev Mode
  const handleDevModeToggle = () => {
    updateDevModeSettings({ dev_mode_enabled: !devModeEnabled });
  };

  // Add Dev Mode recipient
  const addDevModeRecipient = () => {
    const email = newDevEmail.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (devModeRecipients.includes(email)) {
      setError("This email is already in the list");
      return;
    }

    const newRecipients = [...devModeRecipients, email];
    updateDevModeSettings({ dev_mode_recipients: newRecipients });
    setNewDevEmail("");
  };

  // Remove Dev Mode recipient
  const removeDevModeRecipient = (emailToRemove: string) => {
    const newRecipients = devModeRecipients.filter((email) => email !== emailToRemove);
    updateDevModeSettings({ dev_mode_recipients: newRecipients });
  };

  // Fetch Calendar Link
  const fetchCalendarLink = async () => {
    setCalendarLinkLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/settings/calendar-link`);
      if (response.ok) {
        const data = await response.json();
        setCalendarLink(data.calendar_link || "");
        setCalendarLinkInput(data.calendar_link || "");
      }
    } catch (err) {
      console.error("Failed to fetch calendar link:", err);
    } finally {
      setCalendarLinkLoading(false);
    }
  };

  // Update Calendar Link
  const updateCalendarLink = async () => {
    if (!calendarLinkInput.trim()) {
      setError("Please enter a calendar link");
      return;
    }

    // Basic URL validation
    try {
      new URL(calendarLinkInput.trim());
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setCalendarLinkSaving(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/settings/calendar-link`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendar_link: calendarLinkInput.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarLink(data.calendar_link || "");
        setCalendarLinkInput(data.calendar_link || "");
        setSuccessMessage("Calendar link saved successfully");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to save calendar link");
      }
    } catch (err) {
      console.error("Failed to update calendar link:", err);
      setError("Failed to save calendar link");
    } finally {
      setCalendarLinkSaving(false);
    }
  };

  // Delete Calendar Link
  const deleteCalendarLink = async () => {
    setCalendarLinkSaving(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/settings/calendar-link`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCalendarLink("");
        setCalendarLinkInput("");
        setSuccessMessage("Calendar link removed");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to remove calendar link");
      }
    } catch (err) {
      console.error("Failed to delete calendar link:", err);
      setError("Failed to remove calendar link");
    } finally {
      setCalendarLinkSaving(false);
    }
  };

  // Fetch Dev Mode settings on mount
  useEffect(() => {
    fetchDevModeSettings();
  }, []);

  // Fetch Calendar Link on mount
  useEffect(() => {
    fetchCalendarLink();
  }, []);

  // Organization Functions
  const fetchOrganization = async () => {
    setOrgLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/organization`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        // Find current user's role
        if (data.members) {
          const currentMember = data.members.find((m: OrgMember) => m.user_id === user?.id);
          setUserOrgRole(currentMember?.role || null);
        }
        // Fetch members and invites
        await Promise.all([fetchOrgMembers(), fetchOrgInvites(), fetchOrgStats()]);
      } else if (response.status === 404) {
        setOrganization(null);
        setUserOrgRole(null);
        // Check for pending invites
        await fetchPendingInvites();
      } else {
        // Non-404 error response
        setOrganization(null);
        setUserOrgRole(null);
      }
    } catch {
      // Network error or server unavailable - silently handle
      setOrganization(null);
      setUserOrgRole(null);
    } finally {
      setOrgLoading(false);
    }
  };

  const fetchOrgMembers = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/organization/members`);
      if (response.ok) {
        const data = await response.json();
        setOrgMembers(data);
        // Find current user's role
        const currentMember = data.find((m: OrgMember) => m.user_id === user?.id);
        setUserOrgRole(currentMember?.role || null);
      }
    } catch (err) {
      console.error("Failed to fetch org members:", err);
    }
  };

  const fetchOrgInvites = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/organization/invites`);
      if (response.ok) {
        const data = await response.json();
        setOrgInvites(data);
      }
    } catch (err) {
      console.error("Failed to fetch org invites:", err);
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/invites/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data);
      }
    } catch (err) {
      console.error("Failed to fetch pending invites:", err);
    }
  };

  const fetchOrgStats = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/organization/contacts/stats`);
      if (response.ok) {
        const data = await response.json();
        setOrgStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch org stats:", err);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      setError("Please enter an organization name");
      return;
    }

    setOrgSaving(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/organization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        setUserOrgRole("super_admin");
        setShowCreateOrgModal(false);
        setNewOrgName("");
        setSuccessMessage("Organization created successfully! You are the super admin.");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrgMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to create organization");
      }
    } catch (err) {
      console.error("Failed to create organization:", err);
      setError("Failed to create organization");
    } finally {
      setOrgSaving(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setOrgSaving(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/organization/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole }),
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteRole("member");
        setSuccessMessage("Invitation sent successfully!");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrgInvites();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to send invitation");
      }
    } catch (err) {
      console.error("Failed to invite member:", err);
      setError("Failed to send invitation");
    } finally {
      setOrgSaving(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    setOrgSaving(true);
    try {
      const response = await authFetch(`${API_URL}/api/organization/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccessMessage("Invitation revoked");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrgInvites();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to revoke invitation");
      }
    } catch (err) {
      console.error("Failed to revoke invite:", err);
      setError("Failed to revoke invitation");
    } finally {
      setOrgSaving(false);
    }
  };

  const acceptInvite = async (token: string) => {
    setOrgSaving(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/api/invites/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setSuccessMessage("You have joined the organization!");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrganization();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to accept invitation");
      }
    } catch (err) {
      console.error("Failed to accept invite:", err);
      setError("Failed to accept invitation");
    } finally {
      setOrgSaving(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: OrgRole) => {
    setOrgSaving(true);
    try {
      const response = await authFetch(`${API_URL}/api/organization/members/${memberId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setSuccessMessage("Member role updated");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrgMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to update member role");
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("Failed to update member role");
    } finally {
      setOrgSaving(false);
    }
  };

  const removeMember = async () => {
    if (!memberToRemove) return;

    setOrgSaving(true);
    try {
      const response = await authFetch(`${API_URL}/api/organization/members/${memberToRemove.user_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowRemoveMemberModal(false);
        setMemberToRemove(null);
        setSuccessMessage("Member removed from organization");
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchOrgMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to remove member");
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("Failed to remove member");
    } finally {
      setOrgSaving(false);
    }
  };

  const leaveOrganization = async () => {
    setOrgSaving(true);
    try {
      const response = await authFetch(`${API_URL}/api/organization`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowLeaveOrgModal(false);
        setOrganization(null);
        setOrgMembers([]);
        setOrgInvites([]);
        setUserOrgRole(null);
        setSuccessMessage("You have left the organization");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to leave organization");
      }
    } catch (err) {
      console.error("Failed to leave organization:", err);
      setError("Failed to leave organization");
    } finally {
      setOrgSaving(false);
    }
  };

  // Fetch Organization on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrganization();
    }
  }, [user?.id]);

  const getRoleBadgeColor = (role: OrgRole) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getRoleLabel = (role: OrgRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "Member";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      html_content: DEFAULT_SIGNATURE_HTML,
      is_default: false,
    });
    setEditingSignature(null);
    setShowForm(false);
  };

  const handleEdit = (signature: EmailSignature) => {
    setEditingSignature(signature);
    setFormData({
      name: signature.name,
      html_content: signature.html_content || DEFAULT_SIGNATURE_HTML,
      is_default: signature.is_default,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.html_content?.trim()) return;

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
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/settings/signatures/${deletingSignature.id}`,
        { 
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete signature");
      }

      await fetchSignatures();
      setShowDeleteModal(false);
      setDeletingSignature(null);
      setSuccessMessage("Signature deleted successfully");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to delete signature:", err);
      setError(err instanceof Error ? err.message : "Failed to delete signature");
    } finally {
      setIsDeleting(false);
    }
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

        {/* Organization Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Organization</CardTitle>
                    {organization && userOrgRole && (
                      <Badge className={getRoleBadgeColor(userOrgRole)}>
                        {getRoleLabel(userOrgRole)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {organization 
                      ? `Manage your team at ${organization.name}`
                      : "Create or join an organization to collaborate with your team"
                    }
                  </CardDescription>
                </div>
              </div>
              {organization && (userOrgRole === "super_admin" || userOrgRole === "admin") && (
                <Button onClick={() => setShowInviteModal(true)} size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invite Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {orgLoading ? (
              <div className="flex items-center gap-3 py-4">
                <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-500">Loading organization...</span>
              </div>
            ) : organization ? (
              <div className="space-y-6">
                {/* Organization Stats */}
                {orgStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgMembers.length}</p>
                      <p className="text-xs text-slate-500">Team Members</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgStats.organization_total}</p>
                      <p className="text-xs text-slate-500">Total Contacts</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgStats.my_contacts}</p>
                      <p className="text-xs text-slate-500">My Contacts</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{orgStats.unique_members_contributing}</p>
                      <p className="text-xs text-slate-500">Contributors</p>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {orgMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {member.first_name} {member.last_name}
                              {member.user_id === user?.id && <span className="text-slate-500 ml-1">(you)</span>}
                            </p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {getRoleLabel(member.role)}
                          </Badge>
                          {userOrgRole === "super_admin" && member.user_id !== user?.id && (
                            <div className="flex items-center gap-1">
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.user_id, e.target.value as OrgRole)}
                                disabled={orgSaving}
                                className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMemberToRemove(member);
                                  setShowRemoveMemberModal(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          )}
                          {userOrgRole === "admin" && member.role === "member" && member.user_id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMemberToRemove(member);
                                setShowRemoveMemberModal(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invites */}
                {orgInvites.length > 0 && (userOrgRole === "super_admin" || userOrgRole === "admin") && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Pending Invitations</h4>
                    <div className="space-y-2">
                      {orgInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{invite.email}</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Invited as {getRoleLabel(invite.role)} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInvite(invite.id)}
                            disabled={orgSaving}
                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leave Organization */}
                {userOrgRole !== "super_admin" && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      onClick={() => setShowLeaveOrgModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      Leave Organization
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Invites for user */}
                {pendingInvites.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Pending Invitations</h4>
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                              Join {invite.organization_name}
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                              You&apos;ve been invited as {getRoleLabel(invite.role)} by {invite.invited_by.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => acceptInvite(invite.token)}
                          disabled={orgSaving}
                          size="sm"
                        >
                          Accept Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create Organization */}
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Organization Yet
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                    Create an organization to collaborate with your team. Share contact deduplication and manage outreach together.
                  </p>
                  <Button onClick={() => setShowCreateOrgModal(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Organization
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Dev Mode Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Dev Mode</CardTitle>
                    {devModeEnabled && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Redirect all outgoing emails to test recipients instead of actual contacts
                  </CardDescription>
                </div>
              </div>
              {!devModeLoading && (
                <button
                  onClick={handleDevModeToggle}
                  disabled={devModeSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 ${
                    devModeEnabled ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      devModeEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {devModeLoading ? (
              <div className="flex items-center gap-3 py-4">
                <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-500">Loading dev mode settings...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Warning Banner when enabled */}
                {devModeEnabled && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Dev Mode is enabled</p>
                      <p className="text-amber-700 dark:text-amber-300">
                        All scheduled emails will be sent to the test recipients below instead of actual contacts.
                        The email subject will include "[DEV MODE]" prefix.
                      </p>
                    </div>
                  </div>
                )}

                {/* Test Recipients */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Test Recipients</label>
                  
                  {/* Email List */}
                  <div className="flex flex-wrap gap-2">
                    {devModeRecipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                      >
                        {email}
                        <button
                          onClick={() => removeDevModeRecipient(email)}
                          disabled={devModeSaving}
                          className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {devModeRecipients.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No test recipients added. Add at least one email to use dev mode.
                      </p>
                    )}
                  </div>

                  {/* Add Email Input */}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter test email address..."
                      value={newDevEmail}
                      onChange={(e) => setNewDevEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDevModeRecipient())}
                      disabled={devModeSaving}
                      className="flex-1"
                    />
                    <Button
                      onClick={addDevModeRecipient}
                      disabled={devModeSaving || !newDevEmail.trim()}
                      size="sm"
                      variant="outline"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <p>
                    <strong>How it works:</strong> When dev mode is enabled, any email that would be sent
                    to a contact will instead be sent to all test recipients. The email subject will
                    show the original recipient so you can verify the targeting.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Link Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <CardTitle>Calendar Link</CardTitle>
                <CardDescription>
                  Set your calendar booking link for meeting CTAs in email sequences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {calendarLinkLoading ? (
              <div className="flex items-center gap-3 py-4">
                <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-500">Loading calendar settings...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Calendar Link */}
                {calendarLink && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Calendar Link</p>
                      <a 
                        href={calendarLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {calendarLink}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deleteCalendarLink}
                      disabled={calendarLinkSaving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                )}

                {/* Update/Add Calendar Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    {calendarLink ? "Update Calendar Link" : "Add Calendar Link"}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://calendly.com/your-link"
                      value={calendarLinkInput}
                      onChange={(e) => setCalendarLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), updateCalendarLink())}
                      disabled={calendarLinkSaving}
                      className="flex-1"
                    />
                    <Button
                      onClick={updateCalendarLink}
                      disabled={calendarLinkSaving || !calendarLinkInput.trim()}
                      variant={calendarLink ? "outline" : "default"}
                    >
                      {calendarLinkSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        calendarLink ? "Update" : "Save"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Supports Calendly, Cal.com, HubSpot, and other calendar booking services
                  </p>
                </div>

                {/* Info */}
                <div className="text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <p>
                    <strong>How it works:</strong> When you start a contact discovery with a "Book Meeting" or 
                    "Schedule Demo" call-to-action, this calendar link will be included in your email sequences.
                  </p>
                </div>
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
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="name">Signature Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Work Signature"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="html_content">HTML Content *</Label>
                    <textarea
                      id="html_content"
                      placeholder="<p>Best regards,</p>&#10;<p><strong>Your Name</strong></p>"
                      value={formData.html_content || ""}
                      onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                      className="w-full h-48 px-3 py-2 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-sm font-mono resize-y"
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt; to format your signature
                    </p>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="h-48 p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-auto">
                      <div 
                        className="text-sm text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: formData.html_content || "" }}
                      />
                    </div>
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

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.name?.trim() || !formData.html_content?.trim()}>
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
                      <div 
                        className="text-sm text-slate-600 dark:text-slate-400 max-h-20 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: signature.html_content }}
                      />
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

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Create Organization
                </h3>
                <p className="text-sm text-slate-500">
                  You will become the super admin
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="e.g., Acme Inc"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createOrganization()}
                />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">As super admin, you can:</h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Invite and remove team members</li>
                  <li>• Assign roles (admin, member)</li>
                  <li>• Share contact deduplication across the team</li>
                  <li>• Transfer ownership to another member</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateOrgModal(false);
                  setNewOrgName("");
                }}
                disabled={orgSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={createOrganization}
                disabled={orgSaving || !newOrgName.trim()}
              >
                {orgSaving ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Invite Team Member
                </h3>
                <p className="text-sm text-slate-500">
                  Send an invitation to join {organization?.name}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-sm"
                >
                  <option value="member">Member - Standard access</option>
                  <option value="admin">Admin - Can invite & remove members</option>
                  {userOrgRole === "super_admin" && (
                    <option value="super_admin">Super Admin - Full control</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("member");
                }}
                disabled={orgSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={inviteMember}
                disabled={orgSaving || !inviteEmail.trim()}
              >
                {orgSaving ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Organization Modal */}
      {showLeaveOrgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Leave Organization
                </h3>
                <p className="text-sm text-slate-500">
                  {organization?.name}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to leave this organization? You will lose access to shared team features and contact deduplication.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLeaveOrgModal(false)}
                disabled={orgSaving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={leaveOrganization}
                disabled={orgSaving}
              >
                {orgSaving ? "Leaving..." : "Leave Organization"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Remove Member
                </h3>
                <p className="text-sm text-slate-500">
                  {memberToRemove.first_name} {memberToRemove.last_name}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to remove <strong>{memberToRemove.first_name} {memberToRemove.last_name}</strong> from the organization? They will lose access to all team features.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveMemberModal(false);
                  setMemberToRemove(null);
                }}
                disabled={orgSaving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={removeMember}
                disabled={orgSaving}
              >
                {orgSaving ? "Removing..." : "Remove Member"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
