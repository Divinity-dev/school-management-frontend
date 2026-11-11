"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Save, Search, WalletCards } from "lucide-react";
import api from "@/lib/api";

const money = (amount) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 0,
}).format(Number(amount || 0));

export default function SuperAdminSubscriptionPricingPage() {
  const [schools, setSchools] = useState([]);
  const [prices, setPrices] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/super-admin/subscription-pricing");
      const items = response.data?.schools || [];
      setSchools(items);
      setPrices(Object.fromEntries(items.map((school) => [school._id, String(school.pricePerStudent)])));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load school subscription prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);

  const savePrice = async (school, useDefault = false) => {
    const value = Number(prices[school._id]);
    if (!useDefault && (!Number.isFinite(value) || value <= 0)) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    try {
      setSavingId(school._id);
      setError("");
      setNotice("");
      await api.patch(`/super-admin/schools/${school._id}/subscription-pricing`, {
        pricePerStudent: value,
        useDefault,
      });
      setNotice(`${school.name}'s subscription price has been updated.`);
      await loadSchools();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this school's price.");
    } finally {
      setSavingId("");
    }
  };

  const filteredSchools = schools.filter((school) =>
    `${school.name} ${school.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/dashboard/super-admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>

        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><WalletCards className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Subscription pricing</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Set the per-child subscription fee for each school. The platform default is ₦1,000 per student per term. Negotiated prices apply to new subscription payments; existing payment records keep their original amounts.</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">Default price: ₦1,000 per child / term</p>
            </div>
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Schools ({filteredSchools.length})</h2>
          <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search schools..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div>
        </div>

        {loading ? <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading school prices...</div> : (
          <div className="space-y-3">
            {filteredSchools.map((school) => (
              <section key={school._id} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_auto] md:items-center">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{school.name}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">{school.email}</p>
                  <p className="mt-2 text-xs text-slate-500">Current fee: <strong className="text-slate-700">{money(school.pricePerStudent)} / child / term</strong> · {school.isCustom ? "Negotiated rate" : "Default rate"}</p>
                </div>
                <label className="text-xs font-semibold text-slate-600">Fee per child (₦)
                  <input type="number" min="1" step="1" value={prices[school._id] ?? ""} onChange={(event) => setPrices((current) => ({ ...current, [school._id]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={savingId === school._id} onClick={() => savePrice(school)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{savingId === school._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
                  {school.isCustom && <button type="button" disabled={savingId === school._id} onClick={() => savePrice(school, true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Restore default</button>}
                </div>
              </section>
            ))}
            {!filteredSchools.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No schools match your search.</div>}
          </div>
        )}
      </div>
    </main>
  );
}
