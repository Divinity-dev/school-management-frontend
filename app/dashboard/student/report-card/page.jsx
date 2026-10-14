"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import api from "@/lib/api";
import ReportCardDocument from "@/components/results/ReportCardDocument";

function ReportCardContent() {
const searchParams = useSearchParams();

const academicSession = searchParams.get("academicSession");
const academicTerm = searchParams.get("academicTerm");

const [report, setReport] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const fetchReportCard = useCallback(async () => {
if (!academicSession || !academicTerm) {
setReport(null);
setError(
"Please select an academic session and term from your results page."
);
setLoading(false);
return;
}


setLoading(true);
setError("");

try {
  const response = await api.get("/results/report-card", {
    params: {
      academicSession,
      academicTerm,
    },
  });

  const reportData = response.data?.data;

  if (!reportData) {
    throw new Error("The report card could not be loaded.");
  }

  setReport(reportData);
} catch (err) {
  setReport(null);
  setError(
    err.response?.data?.message ||
      err.message ||
      "Failed to load your report card. Please try again."
  );
} finally {
  setLoading(false);
}


}, [academicSession, academicTerm]);

useEffect(() => {
fetchReportCard();
}, [fetchReportCard]);

if (loading) {
return ( <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4"> <Loader2 className="h-9 w-9 animate-spin text-teal-600" /> <p className="text-sm font-medium text-slate-600">
Loading your report card... </p> </div>
);
}

if (error) {
return ( <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-10"> <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"> <h1 className="text-lg font-bold text-slate-900">
Unable to Load Report Card </h1>


      <p className="mt-3 text-sm leading-6 text-slate-600">
        {error}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={fetchReportCard}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        <a
          href="/dashboard/student/results"
          className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Results
        </a>
      </div>
    </div>
  </div>
);


}

return ( <ReportCardDocument
   report={report}
   backHref="/dashboard/student/results"
   backLabel="Back to Results"
 />
);
}

export default function StudentReportCardPage() {
return (
<Suspense
fallback={ <div className="flex min-h-[60vh] items-center justify-center"> <Loader2 className="h-9 w-9 animate-spin text-teal-600" /> </div>
}
> <ReportCardContent /> </Suspense>
);
}
