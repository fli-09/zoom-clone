"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/utils";
import { createInstantMeeting } from "@/lib/api";
import {
  Users,
  Search,
  Video,
  Mail,
  UserPlus,
  Check,
  CheckCircle2,
} from "lucide-react";

export interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "online" | "busy" | "away" | "offline";
  department: string;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Alex Rivera",
    email: "alex.rivera@zoomclone.internal",
    role: "Lead Systems Architect",
    status: "online",
    department: "Infrastructure",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@zoomclone.internal",
    role: "Senior Frontend Engineer",
    status: "online",
    department: "Engineering",
  },
  {
    id: "3",
    name: "Michael Torres",
    email: "michael.torres@zoomclone.internal",
    role: "Product Designer",
    status: "busy",
    department: "Design",
  },
  {
    id: "4",
    name: "Elena Rostova",
    email: "elena.rostova@zoomclone.internal",
    role: "DevOps Engineer",
    status: "away",
    department: "Operations",
  },
  {
    id: "5",
    name: "Marcus Vance",
    email: "marcus.vance@zoomclone.internal",
    role: "Engineering Manager",
    status: "offline",
    department: "Leadership",
  },
];

/**
 * ContactsModal Component
 * Interactive directory allowing users to search teammates, view live presence, and start instant 1:1 calls.
 */
export function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isStartingCall, setIsStartingCall] = useState<string | null>(null);

  // New Contact prompt state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartCallWithContact = async (contact: Contact) => {
    setIsStartingCall(contact.id);
    try {
      const res = await createInstantMeeting();
      success(`Starting direct meeting with ${contact.name}...`);
      onClose();
      router.push(`/meeting/${res.room_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create meeting room";
      error(msg);
      setIsStartingCall(null);
    }
  };

  const handleCopyEmail = async (contact: Contact) => {
    const ok = await copyToClipboard(contact.email);
    if (ok) {
      setCopiedId(contact.id);
      success(`Email for ${contact.name} copied`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    const newEntry: Contact = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: "Team Collaborator",
      status: "online",
      department: "General",
    };
    setContacts([newEntry, ...contacts]);
    setNewEmail("");
    setNewName("");
    setShowAddForm(false);
    success(`Contact "${newName}" added successfully`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-hover" />
          <span>Team Contacts Directory</span>
        </div>
      }
      description="Connect directly with colleagues and initiate instant video meetings"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search & Add Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts by name, email, or department..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-brand transition-all"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1.5 h-9 shrink-0 text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showAddForm ? "Cancel" : "Add"}</span>
          </Button>
        </div>

        {/* Add Contact Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddContact}
            className="p-3 rounded-xl border border-brand/30 bg-dark-bg space-y-2.5 animate-slide-up"
          >
            <h5 className="text-xs font-semibold text-white">Add New Team Member</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-slate-200"
              />
              <input
                type="email"
                required
                placeholder="Work Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-slate-200"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" className="h-7 text-xs">
                Save Contact
              </Button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No contacts found matching &quot;{search}&quot;.
            </div>
          ) : (
            filtered.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-bg/60 hover:bg-dark-card transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={contact.name}
                    size="sm"
                    status={contact.status}
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {contact.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-dark-surface border border-dark-border text-slate-400">
                        {contact.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{contact.role}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyEmail(contact)}
                    className="h-7 text-xs px-2"
                    title="Copy Email"
                  >
                    {copiedId === contact.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartCallWithContact(contact)}
                    isLoading={isStartingCall === contact.id}
                    disabled={Boolean(isStartingCall)}
                    className="h-7 text-xs gap-1 px-2.5"
                    title={`Start instant call with ${contact.name}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
