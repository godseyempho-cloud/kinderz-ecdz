import React from "react";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import DocumentList from "@/components/DocumentList";

// Documents page lists all uploaded documents that the current user may view.
// The list can be filtered by center or by report. For now we render a placeholder
// list; later this will fetch from an API (e.g. GET /api/documents?centerId=...)

export default async function DocumentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return <p className="p-8">Access denied</p>;
  }

  // fetch documents here later
  const dummy = [
    { id: "doc1", filename: "bankstatement.pdf", url: "/docs/bankstatement.pdf", category: "BANK_STATEMENT" },
    { id: "doc2", filename: "receipt.jpg", url: "/docs/receipt.jpg", category: "OTHER" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Uploaded Documents</h1>
      <DocumentList docs={dummy} />
    </div>
  );
}
