"use client";

import { useState } from "react";
import { generateQuarterlyReport } from "../actions";

export function QuarterlyGenerator({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateQuarterlyReport(submissionId, "APPROVED");
      alert("Quarterly Statement Generated!"); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-green-50 border-green-200">
      <h3 className="text-lg font-semibold text-green-800">Quarterly Readiness</h3>
      <p className="text-sm text-green-700 mb-4">All months are cleared. You can now finalize the statement.</p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Quarterly Statement"}
      </button>
    </div>
  );
}