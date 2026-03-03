import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import React from "react";

interface PageProps {
  params: { id: string };
}

// Individual document view.  This page would show metadata and a link to the
// stored file (S3 or other).  For now we display the id only.
export default async function DocumentPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <p className="p-8">Access denied</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Document {params.id}</h1>
      <p>Details would be fetched from the backend.</p>
    </div>
  );
}
