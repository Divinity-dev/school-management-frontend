"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  Inbox,
  History,
  Loader2,
  Pencil,
  Archive,
  CalendarDays,
  Mail,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";

import api from "@/lib/api";

const tabs = [
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "inbox", label: "Reply inbox", icon: Inbox },
  { id: "suppressions", label: "Suppressions", icon: ShieldAlert },
  { id: "activity", label: "Activity", icon: History },
];

const campaignTemplates = [
  {
    id: "introduction",
    label: "SchoolPilot introduction",
    subject: "A free SchoolPilot demonstration for {{schoolName}}",
    html: "<p>Hello {{schoolName}},</p><p>I'm reaching out from <strong>SchoolPilot</strong>, a school management platform designed to simplify school administration.</p><p>We would be happy to give your school a free, personalised demonstration. There is no obligation.</p><p>Would you be available for a short conversation?</p><p>Best regards,<br/>SchoolPilot Team</p>",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    subject: "Following up on SchoolPilot for {{schoolName}}",
    html: "<p>Hello {{schoolName}},</p><p>I wanted to follow up on my earlier message about <strong>SchoolPilot</strong>.</p><p>If your school is exploring ways to simplify administration, student records, results and fee management, we'd be glad to show you how the platform works.</p><p>Would a brief demonstration be convenient?</p><p>Best regards,<br/>SchoolPilot Team</p>",
  },
  {
    id: "demo",
    label: "Demo invitation",
    subject: "Let's arrange a SchoolPilot demo for {{schoolName}}",
    html: "<p>Hello {{schoolName}},</p><p>We'd love to walk your team through SchoolPilot and show how it can support your school's daily operations.</p><p>The demonstration is free and tailored to your school's needs, with no obligation to subscribe.</p><p>Please let us know a convenient day and time.</p><p>Best regards,<br/>SchoolPilot Team</p>",
  },
];

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  demo_booked: "Demo booked",
  not_interested: "Not interested",
  unsubscribed: "Unsubscribed",
  bounced: "Bounced",
  draft: "Draft",
  sending: "Sending",
  sent: "Sent",
  partial: "Partially sent",
  scheduled: "Scheduled",
  failed: "Failed",
  suppressed: "Skipped / suppressed",
  queued: "Queued",
  delivered: "Delivered",
  complained: "Complaint",
};

function StatusPill({ status }) {
  const color = {
    new: "bg-slate-100 text-slate-700",
    contacted: "bg-blue-50 text-blue-700",
    replied: "bg-violet-50 text-violet-700",
    demo_booked: "bg-emerald-50 text-emerald-700",
    not_interested: "bg-amber-50 text-amber-700",
    unsubscribed: "bg-slate-200 text-slate-600",
    bounced: "bg-red-50 text-red-700",
    draft: "bg-slate-100 text-slate-700",
    sending: "bg-blue-50 text-blue-700",
    sent: "bg-emerald-50 text-emerald-700",
    partial: "bg-amber-50 text-amber-700",
    scheduled: "bg-violet-50 text-violet-700",
    failed: "bg-red-50 text-red-700",
    suppressed: "bg-slate-200 text-slate-600",
    queued: "bg-slate-100 text-slate-700",
    delivered: "bg-emerald-50 text-emerald-700",
    complained: "bg-red-50 text-red-700",
  }[status] || "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {statusLabels[status] || status || "Unknown"}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  );
}

function RichEmailEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const command = (name, argument) => {
    editorRef.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("bold")} className="rounded px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-white">B</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("italic")} className="rounded px-3 py-1.5 text-sm italic text-slate-700 hover:bg-white">I</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("underline")} className="rounded px-3 py-1.5 text-sm underline text-slate-700 hover:bg-white">U</button>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("formatBlock", "h2")} className="rounded px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">Heading</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertUnorderedList")} className="rounded px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">Bullet list</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("removeFormat")} className="rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-white">Clear format</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-48 max-h-[420px] overflow-y-auto p-4 text-sm leading-7 text-slate-700 outline-none [&_a]:text-emerald-700 [&_h2]:my-2 [&_h2]:text-xl [&_li]:ml-5 [&_ul]:list-disc"
        data-placeholder="Write your email to schools here..."
      />
    </div>
  );
}

export default function MarketingOutreachPage() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [overview, setOverview] = useState({});
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [suppressions, setSuppressions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleCampaign, setScheduleCampaign] = useState(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [replyText, setReplyText] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [contactForm, setContactForm] = useState({
    schoolName: "",
    email: "",
    category: "Secondary",
    location: "",
  });
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    html: "<p>Hello {{schoolName}},</p><p>I'm reaching out from <strong>SchoolPilot</strong>, a school management platform designed to simplify school administration.</p><p>We would be happy to give your school a free, personalised demonstration. There is no obligation.</p><p>Would you be available for a short conversation?</p><p>Best regards,<br/>SchoolPilot Team</p>",
  });
  const importRef = useRef(null);

  const loadOverview = useCallback(async () => {
    const response = await api.get("/marketing/overview");
    setOverview(response.data.overview || {});
  }, []);

  const loadContacts = useCallback(async () => {
    const response = await api.get("/marketing/contacts", {
      params: { q: query || undefined, status: statusFilter || undefined, category: categoryFilter || undefined, limit: 100 },
    });
    setContacts(response.data.contacts || []);
    setCategories(response.data.categories || []);
  }, [query, statusFilter, categoryFilter]);

  const loadCampaigns = useCallback(async () => {
    const response = await api.get("/marketing/campaigns");
    setCampaigns(response.data.campaigns || []);
  }, []);

  const loadInbox = useCallback(async () => {
    const response = await api.get("/marketing/inbox", { params: { limit: 50 } });
    setMessages(response.data.messages || []);
  }, []);

  const loadSuppressions = useCallback(async () => {
    const response = await api.get("/marketing/suppressions");
    setSuppressions(response.data.suppressions || []);
  }, []);

  const loadActivities = useCallback(async () => {
    const response = await api.get("/marketing/activity", { params: { limit: 100 } });
    setActivities(response.data.activities || []);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadOverview(), loadCampaigns(), loadInbox(), loadSuppressions(), loadActivities()]);
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadCampaigns, loadInbox, loadSuppressions, loadActivities]);

  useEffect(() => {
    refreshAll().catch(() => setLoading(false));
  }, [refreshAll]);

  useEffect(() => {
    loadContacts().catch(() => {});
  }, [loadContacts]);

  const selectedCount = selectedIds.length;
  const allVisibleSelected = contacts.length > 0 && contacts.every((contact) => selectedIds.includes(contact._id));

  const toggleContact = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !contacts.some((contact) => contact._id === id))
      : [...new Set([...current, ...contacts.filter((contact) => !["unsubscribed", "not_interested", "bounced"].includes(contact.status)).map((contact) => contact._id)])]
    );
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    setWorking(true);
    try {
      await api.post("/marketing/contacts", contactForm);
      setContactForm({ schoolName: "", email: "", category: "Secondary", location: "" });
      await Promise.all([loadContacts(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const handleEditContact = async (event) => {
    event.preventDefault();
    if (!editingContact?._id) return;
    setWorking(true);
    try {
      await api.patch(`/marketing/contacts/${editingContact._id}`, {
        schoolName: editingContact.schoolName,
        category: editingContact.category,
        location: editingContact.location,
        phone: editingContact.phone,
        status: editingContact.status,
        notes: editingContact.notes,
      });
      setEditingContact(null);
      await Promise.all([loadContacts(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const handleArchiveContact = async (contact) => {
    if (!window.confirm(`Archive ${contact.schoolName}? It will be hidden from the active contact list and won't be included in new campaigns.`)) return;
    setWorking(true);
    try {
      await api.delete(`/marketing/contacts/${contact._id}`);
      setSelectedIds((current) => current.filter((id) => id !== contact._id));
      await Promise.all([loadContacts(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setWorking(true);
    try {
      const response = await api.post("/marketing/contacts/import", formData, { suppressSuccessToast: true });
      const summary = response.data.summary || {};
      window.dispatchEvent(new CustomEvent("schoolpilot:toast", {
        detail: {
          type: "success",
          message: `Import complete: ${summary.imported || 0} added, ${summary.duplicates || 0} duplicates skipped, ${summary.invalid || 0} invalid rows.`,
        },
      }));
      await Promise.all([loadContacts(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
      event.target.value = "";
    }
  };

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    if (!selectedIds.length) {
      window.dispatchEvent(new CustomEvent("schoolpilot:toast", {
        detail: { type: "error", message: "Select at least one eligible contact first." },
      }));
      return;
    }
    setWorking(true);
    try {
      await api.post("/marketing/campaigns", {
        ...campaignForm,
        contactIds: selectedIds,
      });
      setCampaignForm({ name: "", subject: "", html: "<p>Hello {{schoolName}},</p><p>Write your SchoolPilot message here.</p><p>Best regards,<br/>SchoolPilot Team</p>" });
      setSelectedIds([]);
      await Promise.all([loadCampaigns(), loadOverview(), loadActivities()]);
      setActiveTab("campaigns");
    } finally {
      setWorking(false);
    }
  };

  const handleScheduleBatch = async (event) => {
    event.preventDefault();
    if (!scheduleCampaign || !scheduleDateTime) return;
    const scheduledAt = new Date(scheduleDateTime);
    if (Number.isNaN(scheduledAt.getTime())) return;
    if (!window.confirm(`Schedule the next batch of up to 10 emails for ${scheduleCampaign.name}?`)) return;

    setWorking(true);
    try {
      await api.post(`/marketing/campaigns/${scheduleCampaign._id}/schedule`, {
        confirmSchedule: true,
        scheduledAt: scheduledAt.toISOString(),
      });
      setScheduleCampaign(null);
      setScheduleDateTime("");
      await Promise.all([loadCampaigns(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const handleCancelScheduledBatch = async (campaign) => {
    if (!window.confirm(`Cancel up to 10 scheduled emails for ${campaign.name}? Emails already sent by Resend cannot be cancelled.`)) return;
    setWorking(true);
    try {
      await api.post(`/marketing/campaigns/${campaign._id}/cancel-scheduled`, { confirmCancel: true });
      await Promise.all([loadCampaigns(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const handleSendBatch = async (campaign) => {
    const message = campaign.status === "partial"
      ? "Send the next batch of up to 10 remaining recipients?"
      : `Send this campaign to up to 10 of its ${campaign.recipientCount} recipients now?`;
    if (!window.confirm(`${message}\n\nOnly eligible contacts will receive the email. This action cannot be undone.`)) return;

    setWorking(true);
    try {
      await api.post(`/marketing/campaigns/${campaign._id}/send`, { confirmSend: true });
      await Promise.all([loadCampaigns(), loadOverview(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    setReplyText("");
    const response = await api.get(`/marketing/inbox/${message._id}`);
    setSelectedMessage(response.data.message);
    await Promise.all([loadInbox(), loadOverview()]);
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    setWorking(true);
    try {
      await api.post(`/marketing/inbox/${selectedMessage._id}/reply`, { text: replyText });
      setReplyText("");
      await Promise.all([loadInbox(), loadActivities()]);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> Loading Marketing & Outreach...
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/super-admin" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Super Admin dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Marketing & Outreach</h1>
          <p className="mt-1 text-sm text-slate-500">Manage school prospects, campaigns and replies from one place.</p>
        </div>
        <button type="button" onClick={() => Promise.all([refreshAll(), loadContacts()])} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="School contacts" value={overview.contacts} icon={Users} />
        <MetricCard label="Contacted" value={overview.contacted} icon={Send} />
        <MetricCard label="Replies" value={overview.replied} icon={Mail} />
        <MetricCard label="Unread replies" value={overview.unreadMessages} icon={Inbox} />
      </section>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            <Icon className="h-4 w-4" /> {label}
            {id === "inbox" && overview.unreadMessages > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{overview.unreadMessages}</span>}
          </button>
        ))}
      </div>

      {activeTab === "contacts" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">Import school contacts</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a CSV or Excel file. Duplicate email addresses are skipped.</p>
              </div>
              <button type="button" disabled={working} onClick={() => importRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                <FileSpreadsheet className="h-4 w-4" /> Import CSV / Excel
              </button>
              <input ref={importRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
            </div>
            <p className="text-xs text-slate-500">Expected columns: School Name, Category, Location / Address, Email Address. Maximum 2,000 rows and 5 MB per upload.</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Add a contact</h2>
            <form onSubmit={handleAddContact} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input required value={contactForm.schoolName} onChange={(event) => setContactForm((current) => ({ ...current, schoolName: event.target.value }))} placeholder="School name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <input required type="email" value={contactForm.email} onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <input value={contactForm.category} onChange={(event) => setContactForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <input value={contactForm.location} onChange={(event) => setContactForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location / address" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <div className="sm:col-span-2 lg:col-span-4">
                <button disabled={working} className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60">
                  <Plus className="h-4 w-4" /> Add contact
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">School contacts</h2>
                <p className="mt-1 text-sm text-slate-500">{contacts.length} contacts shown · {selectedCount} selected for a campaign</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search schools or emails" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm sm:w-64" />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <option value="">All statuses</option>
                  {["new", "contacted", "replied", "demo_booked", "not_interested", "unsubscribed", "bounced"].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            </div>
            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-3">
                <p className="text-sm font-medium text-emerald-800">{selectedCount} selected</p>
                <button type="button" onClick={() => setActiveTab("campaigns")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                  Create campaign <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select visible eligible contacts" /></th>
                    <th className="px-5 py-3">School</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Category / Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((contact) => {
                    const blocked = ["unsubscribed", "not_interested", "bounced"].includes(contact.status);
                    return (
                      <tr key={contact._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3"><input type="checkbox" checked={selectedIds.includes(contact._id)} disabled={blocked} onChange={() => toggleContact(contact._id)} aria-label={`Select ${contact.schoolName}`} /></td>
                        <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-800">{contact.schoolName}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-slate-600">{contact.email}</td>
                        <td className="px-5 py-3 text-slate-500">{[contact.category, contact.location].filter(Boolean).join(" · ") || "—"}</td>
                        <td className="px-5 py-3"><StatusPill status={contact.status} /></td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={working}
                              onClick={() => setEditingContact({ ...contact })}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 disabled:opacity-50"
                              aria-label={`Edit ${contact.schoolName}`}
                              title="Edit contact"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={working}
                              onClick={() => handleArchiveContact(contact)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                              aria-label={`Archive ${contact.schoolName}`}
                              title="Archive contact"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!contacts.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No contacts found. Import your school list or add a contact above.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">Create an email campaign</h2>
              <p className="mt-1 text-sm text-slate-500">Select contacts on the Contacts tab first, then prepare and save a draft.</p>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Start from a template</label>
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const template = campaignTemplates.find((item) => item.id === event.target.value);
                    if (template) setCampaignForm((current) => ({ ...current, subject: template.subject, html: template.html }));
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Choose a template (optional)</option>
                  {campaignTemplates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Campaign name</label>
                <input required value={campaignForm.name} onChange={(event) => setCampaignForm((current) => ({ ...current, name: event.target.value }))} placeholder="Benin City school introduction" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email subject</label>
                <input required value={campaignForm.subject} onChange={(event) => setCampaignForm((current) => ({ ...current, subject: event.target.value }))} placeholder="A free SchoolPilot demonstration for {{schoolName}}" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">Email content</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Use {"{{schoolName}}"} to personalise</span>
                    <button type="button" onClick={() => setPreviewOpen(true)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Preview</button>
                  </div>
                </div>
                <RichEmailEditor value={campaignForm.html} onChange={(html) => setCampaignForm((current) => ({ ...current, html }))} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-600">{selectedCount} contacts selected</p>
                <button disabled={working || !selectedCount} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Save campaign draft
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">Campaigns</h2>
              <p className="mt-1 text-sm text-slate-500">Sending is manual and processed in batches of up to 10 recipients.</p>
            </div>
            {campaigns.map((campaign) => (
              <article key={campaign._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{campaign.subject}</p>
                  </div>
                  <StatusPill status={campaign.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-slate-900">{campaign.recipientCount || 0}</p><p className="text-xs text-slate-500">Recipients</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-emerald-700">{campaign.sentCount || 0}</p><p className="text-xs text-slate-500">Sent</p></div>
                  <div className="rounded-lg bg-violet-50 p-2"><p className="text-lg font-bold text-violet-700">{campaign.scheduledCount || 0}</p><p className="text-xs text-slate-500">Scheduled</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-slate-700">{campaign.queuedCount || 0}</p><p className="text-xs text-slate-500">Queued</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-sky-700">{campaign.deliveredCount || 0}</p><p className="text-xs text-slate-500">Delivered</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-red-700">{campaign.bouncedCount || 0}</p><p className="text-xs text-slate-500">Bounced / complaints</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-amber-700">{campaign.failedCount || 0}</p><p className="text-xs text-slate-500">Failed</p></div>
                  <div className="rounded-lg bg-slate-50 p-2"><p className="text-lg font-bold text-violet-700">{campaign.replyCount || 0}</p><p className="text-xs text-slate-500">Replies</p></div>
                </div>
                {campaign.scheduledCount > 0 && (
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => handleCancelScheduledBatch(campaign)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Cancel next scheduled batch (up to 10)
                  </button>
                )}
                {campaign.scheduledAt && campaign.scheduledCount > 0 && (
                  <p className="mt-2 text-xs text-slate-500">Latest batch scheduled for {new Date(campaign.scheduledAt).toLocaleString()}</p>
                )}
                {["draft", "partial", "failed"].includes(campaign.status) && ((campaign.queuedCount || 0) > 0 || (campaign.failedCount || 0) > 0) && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button type="button" disabled={working} onClick={() => handleSendBatch(campaign)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                      <Send className="h-4 w-4" /> Send batch now
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => {
                        setScheduleCampaign(campaign);
                        const minDate = new Date(Date.now() + 10 * 60 * 1000 - new Date().getTimezoneOffset() * 60000);
                        setScheduleDateTime(minDate.toISOString().slice(0, 16));
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                    >
                      <CalendarDays className="h-4 w-4" /> Schedule next 10
                    </button>
                  </div>
                )}
              </article>
            ))}
            {!campaigns.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No campaigns created yet.</div>}
          </section>
        </div>
      )}

      {activeTab === "inbox" && (
        <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
          <div className="border-b border-slate-100 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-bold text-slate-900">Incoming replies</h2>
              <p className="mt-1 text-sm text-slate-500">{messages.length} recent messages</p>
            </div>
            <div className="max-h-[650px] overflow-y-auto">
              {messages.map((message) => (
                <button key={message._id} type="button" onClick={() => openMessage(message)} className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${selectedMessage?._id === message._id ? "bg-emerald-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{message.contact?.schoolName || message.from}</p>
                    {!message.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-700">{message.subject || "(No subject)"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{message.text || "Open to view this email."}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{message.receivedAt ? new Date(message.receivedAt).toLocaleString() : ""}</p>
                </button>
              ))}
              {!messages.length && <div className="p-10 text-center text-sm text-slate-500">No replies have arrived yet.</div>}
            </div>
          </div>
          <div className="flex min-h-[480px] flex-col">
            {selectedMessage ? (
              <>
                <div className="border-b border-slate-100 p-5">
                  <h3 className="font-bold text-slate-900">{selectedMessage.subject || "(No subject)"}</h3>
                  <p className="mt-1 text-sm text-slate-500">From: {selectedMessage.from}</p>
                  {selectedMessage.contact?.schoolName && <p className="text-sm text-slate-500">School: {selectedMessage.contact.schoolName}</p>}
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {selectedMessage.text && <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedMessage.text}</div>}
                  {!selectedMessage.text && selectedMessage.html && (
                    <iframe
                      title="Incoming email content"
                      sandbox=""
                      srcDoc={selectedMessage.html}
                      className="min-h-[320px] w-full rounded-xl border border-slate-100 bg-white"
                    />
                  )}
                  {!selectedMessage.text && !selectedMessage.html && <p className="text-sm text-slate-500">This email does not contain a readable message body.</p>}
                </div>
                <form onSubmit={handleReply} className="border-t border-slate-100 p-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Reply</label>
                  <textarea required rows={5} value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write your reply..." className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500" />
                  <div className="mt-3 flex justify-end">
                    <button disabled={working || !replyText.trim()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Send className="h-4 w-4" /> Send reply</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Mail className="h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">Select a reply</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Incoming school responses will appear here when Resend delivers them to your webhook.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "activity" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">Marketing activity history</h2>
            <p className="mt-1 text-sm text-slate-500">A record of contact changes, imports, campaign sends, replies and unsubscribes.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <article key={activity._id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.actor?.name || activity.actor?.email || "System"}
                    {activity.contact?.schoolName ? ` · ${activity.contact.schoolName}` : ""}
                    {activity.campaign?.name ? ` · ${activity.campaign.name}` : ""}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-400">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}
                </time>
              </article>
            ))}
            {!activities.length && <p className="p-10 text-center text-sm text-slate-500">No marketing activity has been recorded yet.</p>}
          </div>
        </section>
      )}

      {activeTab === "suppressions" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">Suppression list</h2>
            <p className="mt-1 text-sm text-slate-500">Unsubscribed, bounced and complained addresses are excluded from future campaigns.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Email</th><th className="px-5 py-3">Reason</th><th className="px-5 py-3">Added</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {suppressions.map((item) => <tr key={item._id}><td className="px-5 py-3 font-medium text-slate-800">{item.email}</td><td className="px-5 py-3 capitalize text-slate-600">{item.reason}</td><td className="px-5 py-3 text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td></tr>)}
                {!suppressions.length && <tr><td colSpan="3" className="px-5 py-12 text-center text-slate-500">No suppressed addresses.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editingContact && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-contact-title">
          <form onSubmit={handleEditContact} className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="edit-contact-title" className="text-lg font-bold text-slate-900">Edit school contact</h2>
                <p className="mt-1 text-sm text-slate-500">Update the contact details and outreach status.</p>
              </div>
              <button type="button" onClick={() => setEditingContact(null)} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100" aria-label="Close edit contact">✕</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">School name
                <input required value={editingContact.schoolName || ""} onChange={(event) => setEditingContact((current) => ({ ...current, schoolName: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">Email address
                <input disabled value={editingContact.email || ""} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-500" />
              </label>
              <label className="text-sm font-medium text-slate-700">Category
                <input value={editingContact.category || ""} onChange={(event) => setEditingContact((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">Location
                <input value={editingContact.location || ""} onChange={(event) => setEditingContact((current) => ({ ...current, location: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">Phone
                <input value={editingContact.phone || ""} onChange={(event) => setEditingContact((current) => ({ ...current, phone: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">Outreach status
                <select value={editingContact.status || "new"} onChange={(event) => setEditingContact((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal">
                  {["new", "contacted", "replied", "demo_booked", "not_interested", "unsubscribed", "bounced"].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">Next follow-up
                <input type="date" value={editingContact.nextFollowUpAt ? String(editingContact.nextFollowUpAt).slice(0, 10) : ""} onChange={(event) => setEditingContact((current) => ({ ...current, nextFollowUpAt: event.target.value || null }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notes
                <textarea rows={3} value={editingContact.notes || ""} onChange={(event) => setEditingContact((current) => ({ ...current, notes: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingContact(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button disabled={working} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save changes</button>
            </div>
          </form>
        </div>
      )}

      {scheduleCampaign && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="schedule-campaign-title">
          <form onSubmit={handleScheduleBatch} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="schedule-campaign-title" className="text-lg font-bold text-slate-900">Schedule campaign batch</h2>
                <p className="mt-1 text-sm text-slate-500">{scheduleCampaign.name}</p>
              </div>
              <button type="button" onClick={() => setScheduleCampaign(null)} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100" aria-label="Close schedule dialog">✕</button>
            </div>
            <label className="block text-sm font-medium text-slate-700">Send date and time
              <input
                required
                type="datetime-local"
                min={new Date(Date.now() + 5 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                max={new Date(Date.now() + 72 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                value={scheduleDateTime}
                onChange={(event) => setScheduleDateTime(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>
            <p className="text-xs leading-5 text-slate-500">Resend supports scheduled emails up to 72 hours ahead. Each scheduling action handles up to 10 recipients, so larger campaigns can be scheduled in separate batches.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setScheduleCampaign(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button disabled={working || !scheduleDateTime} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Schedule batch</button>
            </div>
          </form>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="campaign-preview-title">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 id="campaign-preview-title" className="font-bold text-slate-900">Email preview</h2>
                <p className="mt-1 text-sm text-slate-500">{campaignForm.subject || "No subject entered"}</p>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button>
            </div>
            <iframe
              title="Campaign email preview"
              sandbox=""
              srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:Arial,sans-serif;padding:24px;color:#334155">${campaignForm.html.replace(/{{\s*schoolName\s*}}/gi, "Sample School")}</body></html>`}
              className="min-h-[420px] w-full flex-1 bg-white"
            />
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-slate-400">
        Marketing emails are sent only after you confirm each batch. Contacts who unsubscribe, bounce or complain are automatically suppressed. Start with a small, relevant group and review replies before sending further batches.
      </p>
    </main>
  );
}
