"use client";
import React from "react";

export type ReconciliationRow = {
  label: string;
  supervisorValue: string | number;
  auditorValue?: string | number;
};

export default function ReconciliationTable({
  rows,
}: {
  rows: ReconciliationRow[];
}) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Item</th>
          <th className="border px-2 py-1">Supervisor</th>
          <th className="border px-2 py-1">Auditor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="border px-2 py-1 font-medium">{r.label}</td>
            <td className="border px-2 py-1">{r.supervisorValue}</td>
            <td className="border px-2 py-1">{r.auditorValue ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
