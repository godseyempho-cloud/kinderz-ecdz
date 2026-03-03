"use client";
import Link from "next/link";
import React from "react";

export type ReportSummary = {
  id: string;
  year: number;
  month: number;
  status: string;
};

export default function ReportList({ reports }: { reports: ReportSummary[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Year</th>
          <th className="border px-2 py-1">Month</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td className="border px-2 py-1">{r.year}</td>
            <td className="border px-2 py-1">{r.month}</td>
            <td className="border px-2 py-1">{r.status}</td>
            <td className="border px-2 py-1">
              <Link href={`/reports/auditor/${r.id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
