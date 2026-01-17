"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Contact, ContactsResponse } from "@/lib/types";
import { authFetch } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(
        API_URL + "/api/contacts?limit=50&offset=0&source=apollo_enriched"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts: " + response.status);
      }

      const data: ContactsResponse = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch contacts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-100 text-green-800">High ({confidence}%)</Badge>;
    } else if (confidence >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium ({confidence}%)</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Low ({confidence}%)</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Contacts
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discovered and enriched contacts from your discovery jobs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Contacts</CardDescription>
              <CardTitle className="text-3xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enriched</CardDescription>
              <CardTitle className="text-3xl">
                {contacts.filter((c) => c.email).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Match Score</CardDescription>
              <CardTitle className="text-3xl">
                {contacts.length > 0
                  ? Math.round(
                      contacts.reduce((acc, c) => acc + c.persona_match_score, 0) /
                        contacts.length
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Contacts</CardTitle>
                <CardDescription>
                  {total} contacts found from Apollo enrichment
                </CardDescription>
              </div>
              <Button variant="outline" onClick={fetchContacts} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Loading contacts...</div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-slate-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400">No contacts yet</p>
                <p className="text-sm text-slate-500">
                  Start a discovery job to find contacts
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                {getInitials(contact.first_name, contact.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {contact.first_name} {contact.last_name}
                              </div>
                              {contact.linkedin_url && (
                                <a
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {contact.title || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contact.company_name || "—"}</div>
                            {contact.company_domain && (
                              <span className="text-xs text-slate-500">
                                {contact.company_domain}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">Not available</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {contact.persona_match_score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getConfidenceBadge(contact.email_confidence)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
