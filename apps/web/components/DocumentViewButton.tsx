"use client";

import { useState } from "react";

interface Props {
  documentId: string;
  filename: string;
}

export function DocumentViewButton({ documentId, filename }: Props) {
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/download?id=${documentId}`);
      const data = await res.json();

      if (data.url) {
        // Option A: Open in new tab (Simple)
        window.open(data.url, "_blank");
        
        // Option B: You could instead trigger a state change 
        // to show the file in your side-by-side viewer
      }
    } catch (error) {
      console.error("Failed to fetch secure link", error);
      alert("Could not load document securely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleView}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
    >
      {loading ? "Securing link..." : `View ${filename}`}
    </button>
  );
}