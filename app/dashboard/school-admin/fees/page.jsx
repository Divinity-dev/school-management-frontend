"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Edit,
  FileText,
  Plus,
  Search,
  WalletCards,
} from "lucide-react";
import api from "@/lib/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getClassName = (schoolClass) => {
  if (!schoolClass) return "Unknown class";

  return [schoolClass.name, schoolClass.arm, schoolClass.section]
    .filter(Boolean)
    .join(" ");
};

export default function FeesPage() {
  const router = useRouter();

  const [feeStructures, setFeeStructures] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeeStructures = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/fee-structures");

        setFeeStructures(response.data?.feeStructures || []);
      } catch (err) {
        console.error("Failed to fetch fee structures:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load fee structures."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructures();
  }, []);

  const filteredFeeStructures = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return feeStructures;
    }

    return feeStructures.filter((feeStructure) => {
      const sessionName =
        feeStructure.academicSession?.name?.toLowerCase() || "";

      const termName =
        feeStructure.academicTerm?.name?.toLowerCase() || "";

      const classNames =
        feeStructure.schoolClasses
          ?.map((schoolClass) => getClassName(schoolClass))
          .join(" ")
          .toLowerCase() || "";

      const itemNames =
        feeStructure.items
          ?.map((item) => item.name)
          .join(" ")
          .toLowerCase() || "";

      return (
        sessionName.includes(query) ||
        termName.includes(query) ||
        classNames.includes(query) ||
        itemNames.includes(query)
      );
    });
  }, [feeStructures, search]);

  const totalStructures = feeStructures.length;

  const activeStructures = feeStructures.filter(
    (feeStructure) => feeStructure.isActive
  ).length;

  const totalConfigured = feeStructures.reduce(
    (total, feeStructure) =>
      total + (Number(feeStructure.totalAmount) || 0),
    0
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <WalletCards
              size={22}
              className="text-emerald-600"
              strokeWidth={1.8}
            />

            <h1 className="text-2xl font-bold text-slate-800">
              Fees
            </h1>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage fee structures for your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/school-admin/fees/create")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={17} strokeWidth={2} />
          Create Fee Structure
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Fee Structures
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {loading ? "—" : totalStructures}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Structures
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {loading ? "—" : activeStructures}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <WalletCards size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Configured Amount
              </p>

              <p className="mt-2 text-xl font-bold text-slate-800">
                {loading ? "—" : formatCurrency(totalConfigured)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <WalletCards size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Fee Structures
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-400">
              View and manage configured school fees.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search fees..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center px-5 py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <p className="mt-3 text-sm font-medium text-slate-400">
                Loading fee structures...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <WalletCards size={21} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              Unable to load fee structures
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
              {error}
            </p>
          </div>
        ) : filteredFeeStructures.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <WalletCards size={24} strokeWidth={1.8} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-700">
              {search
                ? "No fee structures found"
                : "No fee structures yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-400">
              {search
                ? "Try a different search term."
                : "Create your first fee structure to begin managing student fees."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/school-admin/fees/new")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus size={16} />
                Create Fee Structure
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Session / Term
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Classes
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Fee Items
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFeeStructures.map((feeStructure) => (
                    <tr
                      key={feeStructure._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {feeStructure.academicSession?.name ||
                            "—"}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          {feeStructure.academicTerm?.name || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {feeStructure.schoolClasses?.map(
                            (schoolClass) => (
                              <span
                                key={schoolClass._id}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                              >
                                {getClassName(schoolClass)}
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {feeStructure.items?.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between gap-4 text-xs"
                            >
                              <span className="font-medium text-slate-500">
                                {item.name}
                              </span>

                              <span className="font-semibold text-slate-700">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          {formatCurrency(
                            feeStructure.totalAmount
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            feeStructure.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {feeStructure.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/fees/${feeStructure._id}/edit`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredFeeStructures.map((feeStructure) => (
                <div
                  key={feeStructure._id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {feeStructure.academicSession?.name ||
                          "—"}
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-slate-400">
                        {feeStructure.academicTerm?.name || "—"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        feeStructure.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {feeStructure.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Classes
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {feeStructure.schoolClasses?.map(
                        (schoolClass) => (
                          <span
                            key={schoolClass._id}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          >
                            {getClassName(schoolClass)}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {feeStructure.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-xs font-medium text-slate-500">
                          {item.name}
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-base font-bold text-slate-800">
                        {formatCurrency(
                          feeStructure.totalAmount
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/fees/${feeStructure._id}/edit`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Edit
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}