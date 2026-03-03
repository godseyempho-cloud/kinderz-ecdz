"use client";
import React from "react";
import Link from "next/link";

export type DocumentSummary = {
  id: string;
  filename: string;
  url: string;
  category: string;
};

// Simple table listing documents with a link to their detail page.
export default function DocumentList({ docs }: { docs: DocumentSummary[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Filename</th>
          <th className="border px-2 py-1">Category</th>
          <th className="border px-2 py-1">Action</th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d) => (
          <tr key={d.id}>
            <td className="border px-2 py-1">{d.filename}</td>
            <td className="border px-2 py-1">{d.category}</td>
            <td className="border px-2 py-1">
              <Link href={`/documents/${d.id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
